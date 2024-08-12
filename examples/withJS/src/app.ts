// app.ts
import express from "express";
import { initializeModule } from "depsi";
import { appModule } from "./app.module.js";

async function main() {
  const app = express();

  initializeModule(app, appModule);

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}
main();
