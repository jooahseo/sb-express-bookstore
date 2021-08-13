process.env.NODE_ENV = "test";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Book = require("../models/book");

const bookId = "0123456789";

describe("Book Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM books");

    let b1 = await Book.create({
      isbn: bookId,
      amazon_url: "www.test.com",
      author: "test_author",
      language: "english",
      pages: 100,
      publisher: "test_publish",
      title: "Test is important",
      year: 2021,
    });
  });

  /** GET / => {books: [book, ...]}  */

  describe("GET /books", function () {
    test("Get list of books", async function () {
      let response = await request(app).get("/books");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        books: [
          {
            isbn: "0123456789",
            amazon_url: "www.test.com",
            author: "test_author",
            language: "english",
            pages: 100,
            publisher: "test_publish",
            title: "Test is important",
            year: 2021,
          },
        ],
      });
    });
  });

  /** GET /[id]  => {book: book} */

  describe("GET /books/:isbn", function () {
    test("Get a book with isbn", async function () {
      let response = await request(app).get(`/books/${bookId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        book: {
          isbn: "0123456789",
          amazon_url: "www.test.com",
          author: "test_author",
          language: "english",
          pages: 100,
          publisher: "test_publish",
          title: "Test is important",
          year: 2021,
        },
      });
    });
    test("Get a book with invalid id", async function () {
      let response = await request(app).get(`/books/0`);
      expect(response.statusCode).toBe(404);
    });
  });

  /** POST /   bookData => {book: newBook}  */

  describe("POST /books", function () {
    test("create a book", async function () {
      let response = await request(app).post(`/books`).send({
        isbn: "9999",
        amazon_url: "https://www.google.com/",
        author: "test_author2",
        language: "english",
        pages: 1000,
        publisher: "test_publish2",
        title: "Test is important!",
        year: 2021,
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        book: {
          isbn: "9999",
          amazon_url: "https://www.google.com/",
          author: "test_author2",
          language: "english",
          pages: 1000,
          publisher: "test_publish2",
          title: "Test is important!",
          year: 2021,
        },
      });
    });
    test("POST a book with invalid info", async function () {
      let response = await request(app).post(`/books`).send({
        isbn: "9999",
        amazon_url: "https://www.google.com/",
        author: "test_author2",
        language: "english",
        pages: 1000,
        publisher: "test_publish2",
        title: "Test is important!",
        year: 2050,
      });
      expect(response.statusCode).toBe(400);
    });
  });

  /** PUT /[isbn]   bookData => {book: updatedBook}  */

  describe("PUT /books/:isbn", function () {
    test("Update a book", async function () {
      let response = await request(app).put(`/books/${bookId}`).send({
        publisher: "test_publish_rock",
        title: "Test is super important",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        book: {
          isbn: "0123456789",
          amazon_url: "www.test.com",
          author: "test_author",
          language: "english",
          pages: 100,
          publisher: "test_publish_rock",
          title: "Test is super important",
          year: 2021,
        },
      });
    });
    test("Try update a book with invalid info", async function () {
      let response = await request(app).put(`/books/${bookId}`).send({
        author: 123,
      });
      expect(response.statusCode).toBe(400);
    });
    test("Try update a book with invalid isbn", async function () {
      let response = await request(app).put(`/books/0`).send({
        author: "valid_author",
      });
      expect(response.statusCode).toBe(404);
    });
  });

  /** DELETE /[isbn]   => {message: "Book deleted"} */
  describe("DELETE /books/:isbn", ()=>{
      test("Delete a book", async()=>{
          let response = await request(app).delete(`/books/${bookId}`);
          expect(response.statusCode).toBe(200);
      });
      test("Delete a book with invalid isbn", async()=>{
        let response = await request(app).delete(`/books/0`);
        expect(response.statusCode).toBe(404);
    })
  })
});

afterAll(async function () {
  await db.end();
});
