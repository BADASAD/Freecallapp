const remoteAudio = document.getElementById('remoteAudio');
const ringtone = document.getElementById('ringtone');
let currentCall = null;
let localStream = null;
let isMuted = false;

const peer = new Peer();
peer.on('open', id => {
  document.getElementById('my-id').textContent = id;
});

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  localStream = stream;

  peer.on('call', call => {
    ringtone.play();
    call.answer(localStream);
    call.on('stream', remoteStream => {
      ringtone.pause();
      remoteAudio.srcObject = remoteStream;
    });
    currentCall = call;
  });

  window.callPeer = function () {
    const peerId = document.getElementById('peer-id').value;
    const call = peer.call(peerId, localStream);
    call.on('stream', remoteStream => {
      remoteAudio.srcObject = remoteStream;
    });
    currentCall = call;
  };

  window.toggleMute = function () {
    if (!localStream) return;
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
  };

  window.endCall = function () {
    if (currentCall) {
      currentCall.close();
      currentCall = null;
    }
    if (remoteAudio.srcObject) {
      remoteAudio.srcObject.getTracks().forEach(track => track.stop());
      remoteAudio.srcObject = null;
    }
  };

}).catch(error => {
  console.error('Error accessing microphone:', error);
});
