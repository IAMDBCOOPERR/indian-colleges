import { serve } from "@hono/node-server"
import { Hono } from "hono"
const csv = require("csv-parser")
const fs = require("fs")
const { Index, Document } = require("flexsearch")
const app = new Hono()

const mapping = new Map()
const index = new Index({
 tokenize: "full",
 preset: "match",
 document: {
  id: "id",
  index: ["college"],
  store: ["college", "state", "district"],
 },
})
const colleges = []
fs
 .createReadStream("./src/data.csv")
 .pipe(csv())
 .on("data", (data) => colleges.push(data))
 .on("end", () => {
  colleges.forEach((college) => {
   index.add(college.id, college.college)
   mapping.set(college.id, college)
  })
 })

app.get("/", (c) => c.text("Hello Hono!"))
app.get("/s", (c) => c.text("hello"))
app.get("/search", (c) => {
 var keyword = c.req.query("q")
 const r = index.search(keyword, 5)
 const result = r.map((x) => mapping.get(x))
 return c.json(result)
})

serve(app)
