import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import AllBooks from './pages/AllBooks.jsx'
import Reader from './pages/Reader.jsx'
import UploadReader from './pages/UploadReader.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<AllBooks />} />
          <Route path="/book/:slug" element={<Reader />} />
          <Route path="/uploads/:id" element={<UploadReader />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
