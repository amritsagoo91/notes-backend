require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Note = require('./models/note');

const app = express();

// Serve static files from the 'dist' directory
app.use(express.static('dist'));
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan('tiny')); // Log HTTP requests in a concise format

// Uncomment and use if request logging is needed
// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method);
//   console.log('Path:  ', request.path);
//   console.log('Body:  ', request.body);
//   console.log('---');
//   next();
// };
// app.use(requestLogger);

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

// Add a new note
app.post('/api/notes', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))

  {/*const body = request.body;

  // Validate content
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  // Save note to the database
  Note
    .create(note)
    .then((savedNote) => response.json(savedNote))
    .catch((error) => next(error));*/}


});

// Get all notes
app.get('/api/notes', (req, res, next) => {
  Note.find({})
    .then((notes) => res.json(notes))
    .catch((error) => next(error));
});

// Get a note by ID
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Delete a note by ID
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end()) // 204 indicates successful deletion with no content
    .catch((error) => next(error));
});

//Updating
app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  ).
    then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))



})

// Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error);
};
app.use(errorHandler); // Ensure it is the last middleware

const PORT = process.env.PORT || 3001; // Default to 3001 if PORT is not defined
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
