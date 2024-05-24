import React, { useContext, useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import {socket} from '../core'
import { GlobalContext } from '../context/context';

const VideoScreen = (recipient) => {
 const { state, dispatch } = useContext(GlobalContext);
 const [isVideoCalling, setIsVideoCalling] = useState(false);
const localVideoRef = useRef();
const remoteVideoRef = useRef();
const peerConnection = useRef(null);

useEffect(()=>{
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("candidate", handleCandidate);

},[])

const startVideoCall = async ()=>{
setIsVideoCalling(true)
peerConnection.current = new RTCPeerConnection()
const localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
localStream.getTracks().forEach((track)=>{
    peerConnection.current.addTrack(track,localStream)
})
localVideoRef.current.srcObject = localStream
peerConnection.current.onicecandidate = (event)=>{
    if (event.candidate) {
        socket.emit("candidate",{
            to:recipient?._id,
            candidate:event.candidate
        })
        
    }
}
}

  return (
    <div>VideoScreen</div>
  )
}

export default VideoScreen