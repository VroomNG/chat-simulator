import { App as SendbirdApp } from '@sendbird/uikit-react';
import '@sendbird/uikit-react/dist/index.css';
import { useEffect, useRef, useState } from 'react';
import SendBirdCall from 'sendbird-calls';

function App() {
  // Declarations
  const [authenticated, setAuthenticated] = useState(false);
  const queryParameters = new URLSearchParams(window.location.search);
  const [currentCall, setCurrentCall] = useState<any>();
  const [incomingCall, setIncomingCall] = useState<any>();
  const [incoming, setIncoming] = useState(false);
  const [outgoing, setOutgoing] = useState(false);
  const [ongoing, setOngoing] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [callee_name, setCalleeName] = useState<any>();
  
  const [toggleSpeaker, setToggleSpeaker] = useState(false);
  const [mute, setMute] = useState(false);

  const userid = queryParameters.get('userid');
  // const callee_id = queryParameters.get('riderid');
  const callee_id = '87cfd699-8525-4316-a3d2-63ca55f8b152';
  const appid = '0ECAC80D-9CF2-491B-AA64-A5BF65B416AD';
  const sbc = SendBirdCall;
  const uniqueId = Math.random().toString(36).slice(2);

  // Create refs for the local and remote video elements
  const localVideoRef = useRef<HTMLVideoElement | any>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | any>(null);

  useEffect(() => {
    const initializeSendBird = async () => {
      try {
        if (userid) {
          console.log('Initializing SendBird...');
          sbc.init(appid);

          console.log('Authenticating SendBird Calls...');
          const user = await sbc.authenticate({ userId: userid });
          console.log('SendBird Calls authentication successful:', user);

          await setTimeout(() => {
            console.log('Connecting to SendBird Calls WebSocket...');
             sbc.connectWebSocket();
            console.log('SendBird Calls WebSocket connected successfully.');
          }, 2000);

          setAuthenticated(true);
          
          // Add a listener for incoming calls
          sbc.addListener(uniqueId, {
          
            onRinging: (call) => {
              console.log('Incoming call', call);
              setIncoming(true);
              setIncomingCall(call);
              setCalleeName(call?.callee.nickname);

              call.onEstablished = () => {
                console.log('Call established');
              };

              call.onConnected = () => {
                console.log('Call connected');
              };

              // call.onEnded = (call) => {
              //   console.log('Call ended', call);
              // };

              // Accept the call
              // call.accept({
              //   callOption: {
              //     localMediaView: localVideoRef.current!,
              //     remoteMediaView: remoteVideoRef.current!,
              //     audioEnabled: true,
              //     videoEnabled: call.isVideoCall,
              //   },
              // });
              
            },
          });

        }
      } catch (error) {
        console.error('SendBird Calls initialization/authentication failed:', error);
        setAuthenticated(false);
      }
    };

    initializeSendBird();
  }, [userid, appid, sbc]);

  const startCall = (calleeId: any, isVideoCall: boolean) => {
    console.log('Starting call with', calleeId, isVideoCall);

    const dialParams = {
      userId: calleeId,
      isVideoCall: isVideoCall,
      callOption: {
        localMediaView: localVideoRef.current,
        remoteMediaView: remoteVideoRef.current,
        audioEnabled: true,
        videoEnabled: true,
      },
    };

    const call = sbc.dial(dialParams, (call, error) => {
      if (error) {
        console.error('Call failed:', error);
      } else {
        console.log('Call started:', call);
        setCurrentCall(call);
        setOutgoing(true)
        console.log(call?.callee.nickname)
        const callee_name = call?.callee.nickname
        setTimeout(() => {
          setCalleeName(callee_name)
        })
      }
    });

    // Add ringing event listener
    call.onEstablished = () => {
      console.log('Call established');
      
    };

      call.onConnected = () => {
        console.log('Call connected');
        // setRinging(true)
      };
    };
    

  const acceptCall = () => {
    if (currentCall) {
      currentCall.accept();
      console.log('Call accepted', currentCall);
      setOngoing(true)
    } else {
      console.log('no current call')
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.end();
      console.log('Call rejected');
      setIncomingCall(null);
      setIncoming(false);
    } else {
      console.log('no incomingcall')
    }
  };

  const endCall = () => {
    if (currentCall) {
      currentCall.end();
      setCurrentCall(null);
      setOutgoing(false);
      setToggleSpeaker(false)
      setMute(false)
      console.log('Call ended by user', currentCall);
    }
  };
  const toggleSpeakerFunc = () => {
    setToggleSpeaker(!toggleSpeaker)
    console.log(toggleSpeaker)
  }
  const toggleMute = () => {
    setMute(previous => !previous)
    console.log(mute)
  }

  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {authenticated && (
        <div>
          <button onClick={() => startCall(callee_id, false)}>
            <i className='fa fa-phone' style={{ fontSize: '24px',color: 'purple', }}></i>
          </button>
          <button onClick={() => startCall(callee_id, true)}>
          <i className='fa fa-video' style={{ fontSize: '24px',color: 'purple', }}></i>
          </button>
          {outgoing && (
            <div className='current-call'>
              <div className='call-modal'>
                <div className='profile-user'>
                <i className='fa fa-user' style={{ fontSize: '50px',color: 'purple', }}></i>
                </div>
                
                <div className='caller-details'>
                  <p>Calling {callee_name}</p>
                  <p>{ringing? 'Ringing...':'Dialing...'}</p>
                </div>

                <div className='call-actions'>
                <button onClick={()=>toggleSpeakerFunc()} style={{ backgroundColor: toggleSpeaker ? 'white' : 'black' }}>
                    <i className='fa-solid fa-volume-high' style={{ fontSize: '20px', color: toggleSpeaker ? 'black' : 'white' }}></i>
                  </button>
                 
                  <button  onClick={()=>toggleMute()} style={{ backgroundColor: mute ? 'white' : 'black' }}>
                    <i className='fa fa-microphone-slash' style={{ fontSize: '20px', color: mute ? 'black' : 'white' }}></i>
                  </button>
                  
                  <button onClick={()=>endCall()} style={{backgroundColor: 'red'}}>
                    <i className='fa fa-phone-slash' style={{ fontSize: '20px',color: 'white', }}></i>
                  </button>
                </div>
              </div>
              
            </div>
          )}
          {incoming && (
            <div className='current-call'>
              <div className='call-modal'>
                <div className='profile-user'>
                <i className='fa fa-user' style={{ fontSize: '50px',color: 'purple', }}></i>
                </div>
                
                <div className='caller-details'>
                  <p>Incoming Call by {callee_name}</p>
                  <p>Ringing...</p>
                </div>

                <div className='call-actions'>
                 <button onClick={()=>acceptCall()} style={{backgroundColor: 'green'}}>
                    <i className='fa fa-phone' style={{ fontSize: '20px',color: 'white', }}></i>
                  </button>
                  
                  <button onClick={()=>rejectCall()} style={{backgroundColor: 'red'}}>
                    <i className='fa fa-phone-slash' style={{ fontSize: '20px',color: 'white', }}></i>
                  </button>
                </div>
              </div>
              
            </div>
          )}
          {ongoing && (
            <div className='current-call'>
              <div className='call-modal'>
                <div className='profile-user'>
                <i className='fa fa-user' style={{ fontSize: '50px',color: 'purple', }}></i>
                </div>
                
                <div className='caller-details'>
                  <p>Ongoing call {callee_name}</p>
                  <p>...</p>
                </div>

                <div className='call-actions'>
                  <button onClick={()=>toggleSpeakerFunc()} style={{ backgroundColor: toggleSpeaker ? 'white' : 'black' }}>
                    <i className='fa-solid fa-volume-high' style={{ fontSize: '20px', color: toggleSpeaker ? 'black' : 'white' }}></i>
                  </button>
                 
                  <button  onClick={()=>toggleMute()} style={{ backgroundColor: mute ? 'white' : 'black' }}>
                    <i className='fa fa-microphone-slash' style={{ fontSize: '20px', color: mute ? 'black' : 'white' }}></i>
                  </button>
                  
                  <button onClick={()=>endCall()} style={{backgroundColor: 'red'}}>
                    <i className='fa fa-phone-slash' style={{ fontSize: '20px',color: 'white', }}></i>
                  </button>
                </div>
              </div>
              
            </div>
          )}

        </div>
      )}
      <SendbirdApp appId={appid} userId={`${userid}`} />
    </div>
  );
}

export default App;
