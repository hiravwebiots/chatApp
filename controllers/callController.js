const userModel = require('../models/userModel');
const callParticipantModel = require('../models/callParticipantModel')
const callModel = require('../models/callModel');

const initiateCall = async (req, res) => {
    try{
        const initiatorId = req.session.user.id

        const initiator = await userModel.findById(initiatorId)
        if(!initiator){
            return res.status(400).json({ status : 0, message : "initiator not found" })
        }

        const { receiverId, callType } = req.body
        const receiver = await userModel.findById(receiverId)
        if(!receiver){
            return res.status(400).json({ status : 0, message : "receiver not found" })
        }

        if(receiverId === initiatorId) return res.status(400).json({ status : 0, message : `you can't do self call` })

        // Check if initiator already in active call
        const initiatorBusy = await callParticipantModel.findOne({ userId : initiatorId, status : { $in : ['joined', 'invited'] }})
        // console.log("🚀 ~ initiateCall ~ initiatorBusy:", initiatorBusy)
        if(initiatorBusy){
            const activeCall = await callModel.findOne({ _id : initiatorBusy.callId, status : 'active' })
            if(activeCall){
                return res.status(409).json({ status : 0, message : "You are already in another call"})
            }
        }

        // Check if receiver already in active call
        const receiverBusy = await callParticipantModel.findOne({ userId : receiverId, status : { $in : ['joined', 'invited'] } })
        // console.log("🚀 ~ initiateCall ~ receiverBusy:", receiverBusy)
        if(receiverBusy){
            const activeCall = await callModel.findOne({ _id : receiverBusy.callId, status : 'active'})
            if(activeCall){
                return res.status(409).json({ status : 0, message : 'Receiver is on another call'})
            }
        }

        const call = await callModel.create({
            initiatorId,
            receiverId,
            callType,
            status : 'active'
        })

        let participants = []   
        participants = [
            { callId : call.id, userId : initiatorId, status  : 'joined', joinedAt : new Date() },
            { callId : call.id, userId : receiverId, status : 'invited' }
        ]

        await callParticipantModel.insertMany(participants)

        // get IO Instance
        const io = req.app.get('io')
        
        // emit to both user
        io.to(receiverId).emit('call-incoming', {
            callId : call.id,
            callerId : initiatorId, 
            callType : callType
        })


        setTimeout(async () => {
            try{
                const latestCall = await callModel.findById(call.id)
                // console.log("🚀 ~ initiateCall ~ latestCall:", latestCall)

                // If already ended → skip
                if(!latestCall || latestCall.status !== 'active') return

                // check if receiver joined
                const latestParticipant = await callParticipantModel.findOne({
                    callId : call.id,
                    userId : receiverId,
                }) 
                // console.log("🚀 ~ initiateCall ~ latestParticipant:", latestParticipant)

                // if receiver already joined -> skip
                if (latestParticipant.status === 'joined') return

                // if not joined → mark missed
                if(latestParticipant){
                    await callModel.findByIdAndUpdate(call.id, {
                        status : 'ended',
                        endedAt : new Date(),
                        duration : 0
                    })

                    await callParticipantModel.updateOne(
                        { callId : call.id, userId : receiverId },
                        { $set: { status: "missed" } }
                    )
    
                    await callParticipantModel.updateOne(
                        { callId : call.id, userId : initiatorId },
                        { $set: { status: 'not answered' } }
                    )

                    io.to(call.initiatorId.toString()).emit('call-timeout', { callId : call.id })
                    io.to(call.receiverId.toString()).emit('call-timeout', { callId : call.id })

                    console.log('call Time Out Missed Call');
                }   
            } catch(err){
                console.error('error in unanswered call timeout', err)
            }
        }, 20000)

        res.status(200).json({ status : 1, message : 'Successfully initiate Call', data : call })

    } catch(err){   
        console.log(err);
        res.status(500).json({ status : 0, message : "error while initiate call" })
    }
}

const answerCall = async(req, res) => {
    try{
        const receiverId = req.session.user.id

        const receiver = await userModel.findById(receiverId)
        if(!receiver){    
            return res.status(400).json({ status : 0, message : "receiver not found" })
        }

        const { callId } = req.body
        if(!callId) return res.status(400).json({ status : 0, message : 'callId is required' })

        // find call
        const call = await callModel.findById(callId)
        if(!call) return res.status(400).json({ status : 0, message : 'callId not found' })

        if(call.receiverId.toString() !== receiverId){
            return res.status(403).json({ status: 0, message: "You are not allowed to answer this call" })
        }

        // check call active or not
        if(call.status !== 'active'){
            return res.status(400).json({ status : 0, message : 'Call has already ended' })
        }

        // find participent - receiver
        const participant = await callParticipantModel.findOne({
            callId : callId,
            userId : receiverId
        })
        
        if(!participant) return res.status(400).json({ status : 0, message : 'Participant not found' })
        
        if(participant.status === 'joined'){
            return res.status(400).json({ status : 0, message : 'You are already in another call' })
        }

        if(['missed', 'not answered'].includes(participant.status)){
            return res.status(400).json({ status : 0, message : 'call alredy missed' })
        }

        participant.status = 'joined'
        participant.joinedAt = new Date()
        await participant.save()

        call.acceptedTime = new Date()
        await call.save()

        // socket
        const io = req.app.get('io')

        io.to(call.initiatorId.toString()).emit('call-accepted',{
            callId
        })

        res.status(200).json({ status : 1, message : 'call answerd suceessfully', data : call})

    } catch(err){
        console.log(err);
        res.status(500).json({ status : 0, message : 'error while answer call' })
    }
}

const declineCall = async (req, res) => {
    try{
        const receiverId = req.session.user.id

        const receiver = await userModel.findById(receiverId)
        if(!receiver){
            res.status(400).json({ status : 0, message : 'receiver not found' })
        }

        const { callId } = req.body

        if(!callId) return res.status(400).json({ status : 0, message : 'callId is required' })

        const call = await callModel.findById(callId)
        if(!call) return res.status(404).json({ status : 0, message : 'callId not found' })

        // reciver only decline the call
        if(call.receiverId.toString() !== receiverId){
            return res.status(400).json({ status : 0, message : 'You are not allowed to decline this call'  })
        }
        
        if(call.status !== 'active'){
            return res.status(400).json({ status : 0, message : 'call has alredy ended' })
        }

        const participant = await callParticipantModel.findOne({
            callId : call.id,
            userId : receiverId
        })
        if(!participant){
            return res.status(404).json({ status : 0, message : 'you are not invited to this call' })
        }

        //  call status is invite - check condition

        if(participant.status === 'joined'){
            return res.status(400).json({ status : 0, message : 'you already joined this call' })
        }

        if(participant.status === 'declined'){
            return res.status(400).json({ status : 0, message : 'you have already declined the call' })
        }

        // await callParticipantModel.findByIdAndUpdate(
        //     { callId : call.id, userId : receiverId }, 
        //     { $set: { status : 'declined' }}  
        // )

        participant.status = 'declined'
        await participant.save()

        const sendParticipant = await callParticipantModel.findOne({
            callId : call.id,
            userId : senderId
        })

        sendParticipant.status = 'outgoind_declined'
        sendParticipant.save()
        
        // await callModel.findByIdAndUpdate(
        //     { id : call.id },
        //     { $set : { status : 'ended' } }
        // )   

        call.status = 'ended'
        await call.save()

        // socket
        const io = req.app.get('io')
        
        io.to(call.initiatorId.toString()).emit('call-declined', {
            callId
        })

        res.status(200).json({ status : 1, message : 'Successfully declined Call', data : call })
        
    } catch(err){   
        console.log(err);
        res.status(500).json({ status : 0, message : 'error while declineCall' })
    }
}

const endCall = async (req, res) => {
    try{    
        const userId = req.session.user.id
        if(!userId) return res.status(400).json({ status : 0, message : 'user not fouund' })

        const { callId } = req.body
        if(!callId) return res.status(400).json({ status : 0, message : 'callId is required' })

        const call = await callModel.findById(callId)
        if(!call) return res.status(404).json({ status : 0, message : 'call not found' })


        // caller cancels befor pickup
        if(call.status === 'active' && !call.acceptedTime && call.initiatorId.toString() === userId) {
            await callModel.findByIdAndUpdate(
                callId, 
                { status : 'ended', endedAt : new Date() }
            )

            // socket 
            const io = req.app.get('io')

            io.to(call.receiverId.toString()).emit('call-ended', { callId })

            return res.status(200).json({ status : 1, message : 'call cancelled by caller' })
        }

        
        const participant = await callParticipantModel.findOne({ callId : call.id, userId : userId })
        if(!participant) return res.status(403).json({ status : 0, message : 'you are not part of this call' })

        // If already ended
        if(call.status === 'ended'){
            return res.json({ status : 1, message : 'call already ended', duration : call.duration || 0 })
        }

        // participant is left
        if(participant.status === 'joined'){
            await callParticipantModel.findByIdAndUpdate(
                participant.id,
                { status : 'left', leftAt : new Date() }
            )
        }

        // Check remaining participants
        const remainingJoined = await callParticipantModel.countDocuments({ callId : call.id, status : 'joined' })
        // console.log("🚀 ~ endCall ~ activeParticipants:", remainingJoined)

        // If 1 or 0 Participant left → end call
        if(remainingJoined <= 1){
            const endTime = new Date()

            const duration = call.acceptedTime
                ? Math.floor((endTime - call.acceptedTime) / 1000 ) // in second
                : 0;

            await callModel.findByIdAndUpdate(callId, {
                status : 'ended',
                endedAt : endTime,
                duration : duration
            })

            await callParticipantModel.updateMany(
                { callId : call.id, status : 'joined' },
                { status : 'left', leftAt : endTime }
            )
    
            // socket
            const io = req.app.get('io')

            io.to(call.initiatorId.toString()).emit('call-ended', { callId })
            io.to(call.receiverId.toString()).emit('call-ended', { callId })

            return res.status(200).json({ status : 1, message : 'Successfully Call ended', duration : duration })
        }
    
        // If others still in call
        return res.json({ status : 1, message : 'you left the call' })   // fix

    } catch(err){
        console.log(err);
        res.status(500).json({ status : 0, message : 'error while endCall' })
    }
}



module.exports = { initiateCall, answerCall, declineCall, endCall }