// middlewares/logger.js
import morgan from "morgan";
import { currentTime } from "../utils/timeService.js";
import chalk from "chalk";
import fs from "fs";
import path from "path";

/* ---------- file logging helpers ---------- */

// ensure logs dir exists
const LOG_DIR = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) {
	fs.mkdirSync(LOG_DIR, { recursive: true });
}

function todayFilePath(d = new Date()) {
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return path.join(LOG_DIR, `${yyyy}-${mm}-${dd}.log`);
}

// best-effort extract error message from response body
function toMessage(body, fallback) {
	try {
		if (body == null) return fallback;
		if (typeof body === "string") {
			// if it's JSON-as-string, try to parse
			try {
				const parsed = JSON.parse(body);
				if (parsed?.message) return String(parsed.message);
				if (parsed?.error) return String(parsed.error);
			} catch {
				/* ignore parse errors */
			}
			return body.length > 500 ? body.slice(0, 500) + "…" : body;
		}
		if (Buffer.isBuffer(body)) {
			return toMessage(body.toString("utf8"), fallback);
		}
		if (typeof body === "object") {
			if (body.message) return String(body.message);
			if (body.error) return String(body.error);
			return JSON.stringify(body).slice(0, 500);
		}
		return String(body);
	} catch {
		return fallback;
	}
}

/* ---------- your existing console logger (unchanged) ---------- */

const consoleLogger = morgan(function (tokens, req, res) {
	const { year, month, day, hours, minutes, seconds } = currentTime();
	const currentDate = `[${year}/${month}/${day} ${hours}:${minutes}:${seconds}]`;
	const result = [
		currentDate,
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		"-",
		tokens["response-time"](req, res),
		"ms",
	].join(" ");
	if (tokens.status(req, res) >= 400) {
		return chalk.redBright(result);
	} else {
		return chalk.cyanBright(result);
	}
});

/* ---------- file logger (adds 4xx/5xx lines to logs/YYYY-MM-DD.log) ---------- */

function fileLogger(req, res, next) {
	// capture response body by patching res.send (res.json calls send internally)
	const originalSend = res.send.bind(res);
	res.__bodyForLog = undefined;

	res.send = function patchedSend(body) {
		res.__bodyForLog = body;
		return originalSend(body);
	};

	res.on("finish", () => {
		if (res.statusCode >= 400) {
			const { year, month, day, hours, minutes, seconds } = currentTime();
			const stamp = `[${year}/${month}/${day} ${hours}:${minutes}:${seconds}]`;
			const msg = toMessage(res.__bodyForLog, res.statusMessage || "Unknown error");
			const line = `${stamp} status=${res.statusCode} msg=${msg}\n`;

			fs.appendFile(todayFilePath(), line, (err) => {
				if (err) {
					// don't crash app if logging fails
					// eslint-disable-next-line no-console
					console.error("File logger write failed:", err);
				}
			});
		}
	});

	next();
}

/* ---------- export a single middleware that does both ---------- */

// This keeps your console output exactly the same AND writes errors to file.
export default function logger(req, res, next) {
	fileLogger(req, res, () => consoleLogger(req, res, next));
}
