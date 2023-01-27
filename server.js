const express = require('express');
//const { ApolloServer } = require('apollo-server-express');
const session = require('cookie-session');
const helmet = require('helmet');
const hpp = require('hpp');
const csurf = require('csurf');
const dotenv = require('dotenv');
const path = require('path');
//const { authMiddleware } = require('./utils/auth');
//const { typeDefs, resolvers } = require('./schemas');
//const db = require('./config/connection');

dotenv.config({path: path.resolve(__dirname, '.env')});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(hpp());

app.use(
  session({
      name: 'session',
      secret: process.env.COOKIE_SECRET,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  })
);
app.use(csurf());


// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: authMiddleware,
// });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
// }

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

// Create a new instance of an Apollo server with the GraphQL schema
// const startApolloServer = async (typeDefs, resolvers) => {
//   await server.start();
//   server.applyMiddleware({ app });
  
//   db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`)
    })
//       console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
//     })
//   })
//   };
  
// Call the async function to start the server
//startApolloServer(typeDefs, resolvers);

module.exports = app;