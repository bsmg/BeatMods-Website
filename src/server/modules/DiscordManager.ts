import axios from "axios";
import config from "../config";
export default class DiscordManager {
    public sendWebhook = async (title: string, fields: dynamic[], url: string) => {
        let color: number;
        const status = title.split(" ")[1];
        switch (status) {
            case "approved":
                color = 0x42f47d;
                break;
            case "denied":
                color = 0xf44141;
                break;
            default:
                color = 0x34296c;
        }
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
