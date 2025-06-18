import dotenv from "dotenv";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import archiver from "archiver";
import cron from "node-cron";

//import { systemLogger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
//console.log("MONGO URI:", process.env.MONGO);

const uri = process.env.MONGOB;
const backupDir = path.join(__dirname, "..", "backups");
const dbName = "booking";

if (!fs.existsSync(backupDir)) {
  console.log("Backup folder doesn't exist! It will be created.");
  //systemLogger.warn("Backup folder doesn't exist! It will be created.", {
  //traceId,
  //transactionId: transaction?.id,
  //backup_date: date,
  //backup_path: zipPath,
  //});
  fs.mkdirSync(backupDir);
}

function performBackup() {
  //const transaction = apm.startTransaction("System-[log]", "system");
  //const traceId = apm?.currentTraceIds?.["trace.id"];

  //transaction?.addLabels({
  //  userID: "system",
  //  endpoint: "system",
  //  method: "SCRIPT",
  //});

  const date = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFolder = `database-backup-${date}`;
  const backupPath = path.join(backupDir, backupFolder);
  const zipPath = path.join(backupDir, `${backupFolder}.zip`);

  console.log("Starting backup...");
  //systemLogger.info("Starting backup...", {
  //traceId,
  //transactionId: transaction?.id,
  //backup_date: date,
  //backup_path: zipPath,
  //});

  if (!fs.existsSync(backupDir)) {
    console.log("Backup folder doesn't exist! It will be created.");
    //systemLogger.warn("Backup folder doesn't exist! It will be created.", {
    //traceId,
    //transactionId: transaction?.id,
    //backup_date: date,
    //backup_path: zipPath,
    //});
    fs.mkdirSync(backupDir);
  }

  const cmd = `mongodump --uri='${uri}' --out=${backupPath}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.log(`Backup error: ${err.message}`);
      //systemLogger.error(`Backup error: ${err.message}`, {
      //traceId,
      //transactionId: transaction?.id,
      //backup_date: date,
      //backup_path: zipPath,
      //});
      return;
    }

    console.log("Backup was successfully! Compressing backup...");
    //systemLogger.info("Backup was successfully! Compressing backup...", {
    //traceId,
    //transactionId: transaction?.id,
    //backup_date: date,
    //backup_path: zipPath,
    //});

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`Archive created successfully! (${archive.pointer()} bytes)`);
      //systemLogger.info(
      //`Archive created successfully! (${archive.pointer()} bytes)`,
      //{
      //traceId,
      //transactionId: transaction?.id,
      //backup_date: date,
      //backup_path: zipPath,
      //}
      //);

      fs.rmSync(backupPath, { recursive: true, force: true });
      console.log("Temporary backup folder deleted successfully!");
      //systemLogger.info(`Temporary backup folder deleted successfully!`, {
      //traceId,
      //transactionId: transaction?.id,
      //backup_date: date,
      //backup_path: zipPath,
      //});
    });

    archive.on("error", (err) => {
      console.log(`Error archiving: ${err.message}`);
      //systemLogger.error(`Error archiving: ${err.message}`, {
      //traceId,
      //transactionId: transaction?.id,
      //backup_date: date,
      //backup_path: zipPath,
      //});
    });

    //if (transaction) transaction.end();

    archive.pipe(output);
    archive.directory(backupPath, false);
    archive.finalize();
  });

  //if (transaction) transaction.end();
}

performBackup();

if (process.env.ENABLE_BACKUP_CRON === "true") {
  console.log("Cron script started!");

  cron.schedule("0 2 * * *", () => {
    console.log("Running scheduled backup: ", new Date().toLocaleDateString());
    performBackup();
  });
}
