# WhatsApp-like Chat UI React Application

This project is an implementation of a WhatsApp-like chat UI in React with real-time messaging functionality that can work across different computers on the same network.

## Project Overview

The application provides a chat interface where multiple users can communicate with each other in real-time across different browser instances and different computers, similar to WhatsApp. It's built with React and uses functional components with React Hooks for state management, and Socket.io for real-time communication.

## Features

- **Username Selection**: Choose your own username when you join the chat
- **Real-time Messaging**: Send and receive messages in real-time across different browser windows
- **User List**: Display of online users with status indicators
- **Direct Messaging**: Ability to select a user and send private messages
- **Group Chat**: Public chat room where all messages are visible to everyone
- **Join/Leave Notifications**: System messages when users join or leave the chat
- **JSX Layout**: React component with chat interface (input field, send button, and chat window)
- **Message State**: Using React's useState hook to store and manage chat messages
- **Socket.io Integration**: Real-time bidirectional communication between clients and server

## How to Run the Project

### On a Single Computer

To run the project with both client and server:

```
npm run dev
```

This will start both the React frontend (on port 3000) and the Socket.io server (on port 5000) concurrently.

### Across Different Computers

1. First, run the setup script to see your network interfaces:

```
npm run setup
```

2. Start the application:

```
npm run dev
```

3. On the computer running the server, open:
   ```
   http://localhost:3000
   ```

4. On other computers connected to the same network, try one of these options:

   a) Using IP address:
   ```
   http://<server-ip-address>:3000
   ```
   (Replace `<server-ip-address>` with the IP address shown by the setup script)
   
   b) Using hostname (if IP doesn't work):
   ```
   http://<server-hostname>:3000
   ```
   (Replace `<server-hostname>` with your computer's hostname, e.g., http://MAQN1761:3000)

5. If you're having connection issues, try the network test page:
   ```
   http://<server-ip-address>:3000/network-test.html
   ```

To test the WhatsApp-like functionality:
1. Enter a username in the modal that appears when you first connect
2. Send messages from one computer and observe them appearing on the other computers
3. Click on a user in the sidebar to send private messages to that specific user
4. Notice the system notifications when users join or leave the chat

## Important Notes

- All computers must be connected to the same network
- Firewalls may need to be configured to allow connections on ports 3000 and 7777
- For best results, use modern browsers (Chrome, Firefox, Edge, etc.)
- If WiFi connections work but Ethernet doesn't:
  - Try using your computer's hostname instead of IP address
  - Check if your router isolates Ethernet and WiFi networks
  - Temporarily disable your firewall for testing
  - Make sure both computers can ping each other

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs only the React frontend in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run server`

Runs only the Socket.io server on port 5000.

### `npm run dev`

Runs both the client and server concurrently (recommended).

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
