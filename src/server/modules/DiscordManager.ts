import axios from "axios";
import config from "../config";
export default class DiscordManager {
    public sendWebhook = async (title: string, fields: dynamic[], url: string) => {
        let color: number = title.includes("approved")
            ? 0x42f47d
            : title.includes("declined")
            ? 0xf44141
            : 0x34296c;

        const body = {
            embeds: [
                {
                    title,
                    ...(url ? { url } : null),
                    timestamp: new Date().toISOString(),
                    color: color,
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
