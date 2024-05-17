import { App as SendbirdApp } from '@sendbird/uikit-react';
import '@sendbird/uikit-react/dist/index.css';

function App() {
  const queryParameters = new URLSearchParams(window.location.search)
  const userid = queryParameters.get("userid")
  console.log('vroom driver id',userid)
  return (
    <div style={{ width:'100vw', height:'100vh' }}>
      <SendbirdApp
        // You can find your Sendbird application ID on the Sendbird dashboard. 
        appId={'0ECAC80D-9CF2-491B-AA64-A5BF65B416AD'}
        // Specify the user ID you've created on the dashboard.
        // Or you can create a user by specifying a unique userId.  
        userId={`${userid}`}
      />
    </div>
  )
}

export default App;