const express = require("express");
const { exec } = require("child_process");
const util = require("util");
const os = require("os");

const { log } = require("console");

const app = express();
const PORT = 3000;

const execPromise = util.promisify(exec);

const platform = os.platform();
const platformSupports = ["win32", "linux"];

if (!platformSupports.includes(platform)) {
    log("[Status Server] API is not support your OS.");
    process.exit();
}

function formatBytes(bytes = 0, isSpeed = false) {
    const num = Number(bytes);
    const units = isSpeed ? ["Kbps", "Mbps", "Gbps"] : ["MB", "GB"];
    const divisor = isSpeed ? 1024 : 1024 ** 2;
    let value = num / divisor;

    for (let i = 0; i < units.length; i++) {
        if (value < 1024 || i === units.length - 1) {
            return `${value.toFixed(2)} ${units[i]}`;
        }
        value /= 1024;
    }
};

function getOSInfo() {
    return os.type();
}

async function getCPUInfo() {
    if (platform === "win32") {
        const { stdout } = await execPromise("wmic cpu get Name,NumberOfCores,NumberOfLogicalProcessors,LoadPercentage");
        const lines = stdout.trim().split("\n").slice(1);
        const cpus = lines.map(line => {
            const [loadPercentage, name, cores, threads] = line.trim().split(/\s{2,}/);
            return {
                model: name,
                cores: Number(cores),
                threads: Number(threads),
                usage: Number(loadPercentage) || 0,
            };
        });
    
        const totalUsage = cpus.reduce((sum, cpu) => sum + cpu.usage, 0);
        return {
            cpus,
            model: cpus[0].model,
            cores: cpus.reduce((sum, cpu) => sum + cpu.cores, 0),
            threads: cpus.reduce((sum, cpu) => sum + cpu.threads, 0),
            usage: Number((totalUsage / cpus.length).toFixed(2)),
        };
    } else
    if (platform === "linux") {
        const lscpu = await execPromise("lscpu | grep -E 'Model name|Core|Thread'");
        const lines = lscpu.stdout.trim().split("\n");

        const top = await execPromise('top -bn1 | grep "Cpu(s)"');

        const cpuUsage = Number(top.stdout.split('id,')[0].split(',')[1].trim().split(' ')[0]);
        const model = lines[0].trim().split(/\s{2,}/)[1];
        const threads = Number(lines[1].trim().split(/\s{2,}/)[1]);
        const cores = Number(lines[2].trim().split(/\s{2,}/)[1]);

        return {
            model: model,
            cores: cores,
            threads: cores * threads,
            usage: Number(cpuUsage.toFixed(2)),
        };
    }
}

function getRAMInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usage = Number((100 - (free / total) * 100).toFixed(2));

    return {
        total: formatBytes(total),
        free: formatBytes(free),
        used: formatBytes(used),
        usage,
    }
}

async function getDiskInfo() {
    if (platform === "win32") {
        const { stdout } = await execPromise("wmic logicaldisk get size,freespace,caption");
        const lines = stdout.trim().split("\n").slice(1);

        let totalSize = 0;
        let freeSize = 0;

        const disks = lines.map(line => {
            const [caption, free, size] = line.trim().split(/\s+/);

            freeSize += Number(free);
            totalSize += Number(size);

            return {
                drive: caption,
                total: formatBytes(size),
                free: formatBytes(free),
                used: formatBytes(Number(size) - Number(free)),
                usage: Number((100 - (free / size) * 100).toFixed(2)),
            };
        });

        return {
            disks,
            total: formatBytes(totalSize),
            free: formatBytes(freeSize),
            used: formatBytes((totalSize - freeSize)),
            usage: Number((100 - (freeSize / totalSize) * 100).toFixed(2)),
        };
    } else
    if (platform === "linux") {
        const { stdout } = await execPromise("df --block-size=1 | grep '^/dev'");
        const lines = stdout.trim().split("\n");

        let totalSize = 0;
        let freeSize = 0;
        
        const disks = lines.map(line => {
            const [dir, size, use, avai] = line.trim().split(/\s+/);
            const free = Number(avai);
            const total = Number(size);

            freeSize += free;
            totalSize += total;

            return {
                drive: dir,
                total: formatBytes(total),
                free: formatBytes(free),
                used: formatBytes(total - free),
                usage: Number((100 - (free / total) * 100).toFixed(2)),
            }
        });

        return {
            disks,
            total: formatBytes(totalSize),
            free: formatBytes(freeSize),
            used: formatBytes((totalSize - freeSize)),
            usage: Number((100 - (freeSize / totalSize) * 100).toFixed(2)),
        };
    }
}

async function getNetworkInfo(prevData = { received: 0, sent: 0 }) {
    if (platform === "win32") {
        const { stdout } = await execPromise("netstat -e");
        const statsLine = stdout.trim().split("\n").find(line => line.includes("Bytes"));
        const [received, sent] = statsLine.match(/\d+/g).map(Number);

        const speed = {
            received: received - prevData.received,
            sent: sent - prevData.sent,
        };

        return {
            received: formatBytes(received),
            sent: formatBytes(sent),
            speed: {
                received: formatBytes(speed.received, true),
                sent: formatBytes(speed.sent, true),
            },
            raw: { received, sent },
        };
    } else
    if (platform === "linux") {
        const { stdout } = await execPromise("cat /proc/net/dev | grep eth0 | awk '{print $2, $10}'");
        const [received, sent] = stdout.trim().split(/\s+/).map(Number);

        const speed = {
            received: received - prevData.received,
            sent: sent - prevData.sent,
        };

        return {
            received: formatBytes(received),
            sent: formatBytes(sent),
            speed: {
                received: formatBytes(speed.received, true),
                sent: formatBytes(speed.sent, true),
            },
            raw: { received, sent },
        };
    }
}

function getUptime() {
    let uptime;

    const duration = os.uptime() * 1000;

    const seconds = parseInt((duration / 1000) % 60);
    const minutes = parseInt((duration / (1000 * 60)) % 60);
    const hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    const days = parseInt(duration / (1000 * 60 * 60 * 24));

    const day = days < 10 ? "0" + days : days;
    const hour = hours < 10 ? "0" + hours : hours;
    const minute = minutes < 10 ? "0" + minutes : minutes;
    const second = seconds < 10 ? "0" + seconds : seconds;

    if (days >= 1) {
        uptime = `${day}:${hour}:${minute}:${second}`;
    } else
    if (hours >= 1) {
        uptime = `${hour}:${minute}:${second}`;
    } else {
        uptime = `${minute}:${second}`;
    }

    return uptime;
}

function getNodeVersion() {
    return process.version.replace('v', '');
}

let cachedData = {};
let previousNetworkData = { received: 0, sent: 0 };
const updateStatsInterval = 1000;

const updateStats = async () => {
    try {
        const [os, cpu, ram, disk, network, uptime, nodejs] = await Promise.all([
            getOSInfo(),
            getCPUInfo(),
            getRAMInfo(),
            getDiskInfo(),
            getNetworkInfo(previousNetworkData),
            getUptime(),
            getNodeVersion(),
        ]);
        previousNetworkData = network.raw;
        cachedData = { os, cpu, ram, disk, network, uptime, nodejs };
    } catch (error) {
        console.error("Failed to update stats:", error);
    }
};

updateStats();
setInterval(updateStats, updateStatsInterval);

app.get('/', (req, res) => {
    res.send('API Status Server V2 By. RIIIXCH');
});

app.get("/status", (req, res) => {
    res.json({ data: cachedData });
});

app.all('*', (req, res) => {
    res.send('API Status Server V2 By. RIIIXCH');
});

app.listen(PORT, () => {
    log(`[Status Server] API is running on http://localhost:${PORT}`);
    log(`[Status Server] Fetch API : http://localhost:${PORT}/status`);
});
