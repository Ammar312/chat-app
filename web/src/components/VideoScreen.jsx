// import React, { useContext, useEffect, useRef, useState } from "react";
// import { socket } from "../core";
// import { GlobalContext } from "../context/context";

// const VideoScreen = (recipient) => {
//   const { state, dispatch } = useContext(GlobalContext);
//   const [isVideoCalling, setIsVideoCalling] = useState(false);
//   const localVideoRef = useRef();
//   const remoteVideoRef = useRef();
//   const peerConnection = useRef(null);

// useEffect(()=>{
// startVideoCall()
// },[])

//   useEffect(() => {
//     socket.on("offer", handleOffer);
//     socket.on("answer", handleAnswer);
//     socket.on("candidate", handleCandidate);
//   }, []);

//   const startVideoCall = async () => {
//     setIsVideoCalling(true);
//     peerConnection.current = new RTCPeerConnection();
//     const localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localStream.getTracks().forEach((track) => {
//       peerConnection.current.addTrack(track, localStream);
//     });
//     localVideoRef.current.srcObject = localStream;
//     peerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("candidate", {
//           to: recipient?._id,
//           candidate: event.candidate,
//         });
//       }
//     };
//     peerConnection.current.ontrack = (event) => {
//       const [remoteStream] = event.streams;
//       remoteVideoRef.current.srcObject = remoteStream;
//     };
//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);

//     socket.emit("offer", {
//       to: recipient?._id,
//       offer,
//     });
//   };
//   const handleOffer = async (data) => {
//     if (!isVideoCalling) {
//       setIsVideoCalling(true);
//       peerConnection.current = new RTCPeerConnection();
//     }
//     await peerConnection.current.setRemoteDescription(
//       new RTCSessionDescription(data.offer)
//     );
//     const localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localStream.getTracks().forEach((track) => {
//       peerConnection.current.addTrack(track, localStream);
//     });
//     localVideoRef.current.srcObject = localStream;
//     const answer = await peerConnection.current.createAnswer();
//     await peerConnection.current.setLocalDescription(answer);
//     socket.emit("answer", {
//       to: data.from,
//       answer,
//     });
//   };
//   const handleAnswer = async (data) => {
//     await peerConnection.current.setRemoteDescription(
//       new RTCSessionDescription(data.answer)
//     );
//   };
//   const handleCandidate = async (data) => {
//     try {
//       await peerConnection.current.addIceCandidate();
//       new RTCIceCandidate(data.candidate);
//     } catch (error) {
//       console.error("Error adding received ice candidate", error);
//     }
//   };

//   return <div>
//   {isVideoCalling && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="relative w-[90%] max-w-[800px] bg-white p-4 rounded-md">
//             <video
//               ref={localVideoRef}
//               autoPlay
//               playsInline
//               className="w-full"
//             />
//             <video
//               ref={remoteVideoRef}
//               autoPlay
//               playsInline
//               className="w-full"
//             />
//             <button
//               className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
//               onClick={() => setIsVideoCalling(false)}
//             >
//               End Call
//             </button>
//           </div>
//         </div>
//       )}
//   </div>;
// };

// export default VideoScreen;


import React, { useEffect, useRef } from "react";
import { socket } from "../core";

const VideoScreen = ({ recipientId, currentUserId, onClose }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);

  useEffect(() => {
    const startVideoCall = async () => {
      peerConnection.current = new RTCPeerConnection();

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (peerConnection.current) {
        localStream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, localStream);
        });

        localVideoRef.current.srcObject = localStream;

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("candidate", {
              to: recipientId,
              candidate: event.candidate,
            });
          }
        };

        peerConnection.current.ontrack = (event) => {
          const [remoteStream] = event.streams;
          remoteVideoRef.current.srcObject = remoteStream;
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("offer", {
          to: recipientId,
          offer,
        });
        console.log("Emiting offer")
      }
    };

    startVideoCall();

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("candidate", handleCandidate);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("candidate", handleCandidate);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      onClose();
    };
  }, [recipientId, currentUserId, onClose]);

  const handleOffer = async (data) => {
    if (data.from !== recipientId) return;

    if (peerConnection.current?.signalingState === "closed") {
      return;
    }

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (peerConnection.current) {
      localStream.getTracks().forEach((track) => {
        if (peerConnection.current.signalingState !== "closed") {
          peerConnection.current.addTrack(track, localStream);
        }
      });

      localVideoRef.current.srcObject = localStream;

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        to: data.from,
        answer,
      });
    }
  };

  const handleAnswer = async (data) => {
    if (data.from !== recipientId) return;

    if (peerConnection.current?.signalingState === "closed") {
      return;
    }

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  };

  const handleCandidate = async (data) => {
    if (data.from !== recipientId) return;

    if (peerConnection.current?.signalingState === "closed") {
      return;
    }

    try {
      await peerConnection.current.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    } catch (error) {
      console.error("Error adding received ice candidate", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative w-[90%] max-w-[800px] bg-white p-4 rounded-md">
        <video ref={localVideoRef} autoPlay playsInline className="w-full" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full" />
        <button
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
          onClick={() => {
            if (peerConnection.current) {
              peerConnection.current.close();
              peerConnection.current = null;
            }
            onClose();
          }}
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoScreen;
