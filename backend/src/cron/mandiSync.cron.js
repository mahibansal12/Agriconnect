import cron from "node-cron";
import { syncMandiRates } from "../services/mandi.service.js";

const startMandiSyncCron = () => {
  
    // Every day at 6:00 AM

    cron.schedule("0 6 * * *", async () => {
        console.log("Starting Mandi Synchronization...");

        try {

            await syncMandiRates();
            console.log("Mandi Synchronization Completed");

        } catch (error) {
            console.error("Cron Error :", error.message);
        }

    });

};

export { startMandiSyncCron };