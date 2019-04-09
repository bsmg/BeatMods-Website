import axios from "axios";
import config from "../config";
export default class DiscordManager {
    public sendWebhook = async (title: string, fields: dynamic[], url: string) => {
        const body = {
            embeds: [
                {
                    title,
                    ...(url ? { url } : null),
                    timestamp: new Date().toISOString(),
                    color: 0x34296c,
                    fields: fields
                }
            ]
        };
        try {
            for (const webhook_url of config.discord.webhook_url) {
                await axios.post(webhook_url, body, { headers: { "Content-Type": "application/json" } });
            }
            return true;
        } catch (err) {
            console.error(err);
        }
        return false;
    }
}
