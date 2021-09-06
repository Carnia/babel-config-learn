import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import child_process from "child_process";
import util from "util";
import chalk from "chalk";
import semverInc from "semver/functions/inc";
import { ReleaseType } from "semver";

// import pkg from '../package.json'
const pkg = require("../package.json");

const exec = util.promisify(child_process.exec);

const run = async (command: string) => {
  timeLog(command, "run");
  return await exec(command);
};

const currentVersion = pkg.version;

const getNextVersions = (): { [key in ReleaseType]: string | null } => ({
  major: semverInc(currentVersion, "major"),
  minor: semverInc(currentVersion, "minor"),
  patch: semverInc(currentVersion, "patch"),
  premajor: semverInc(currentVersion, "premajor"),
  preminor: semverInc(currentVersion, "preminor"),
  prepatch: semverInc(currentVersion, "prepatch"),
  prerelease: semverInc(currentVersion, "prerelease")
});

function timeLog(logInfo: string, type?: "start" | "end" | "run") {
  let info = logInfo;
  if (type === "start") {
    info = `🐴 开始任务：${logInfo}`;
  } else if (type === "end") {
    info = `✨ 结束任务：${logInfo}\n`;
  } else if (type === "run") {
    info = `🚴 任务执行：${chalk.green(logInfo)}`;
  }

  const nowDate = new Date();
  const dateTag = `${nowDate.toLocaleString()}.${nowDate
    .getMilliseconds()
    .toString()
    .padStart(3, "0")}`;

  console.log(`[${chalk.gray(dateTag)}]`, info);
}

/** 获取下一次版本号 */
async function prompt(): Promise<string> {
  const nextVersions = getNextVersions();
  const { nextVersion } = await inquirer.prompt([
    {
      type: "list",
      name: "nextVersion",
      message: `请选择将要发布的版本 (当前版本 ${currentVersion})`,
      choices: (Object.keys(nextVersions) as Array<ReleaseType>).map(level => ({
        name: `${level} => ${nextVersions[level]}`,
        value: nextVersions[level]
      }))
    }
  ]);
  return nextVersion;
}

/** 发布环境选择 */
async function promptBrowser(): Promise<string> {
  const { env } = await inquirer.prompt([
    {
      type: "list",
      name: "env",
      message: `请选择将要发布的环境`,
      choices: [
        {
          key: "0",
          name: "cjs+browser(平安内网包+外网第三方用的script链接资源)",
          value: "0"
        },
        {
          key: "1",
          name: "cjs(平安内网包)",
          value: "1"
        },
        {
          key: "2",
          name: "browser(外网第三方用的script链接资源)",
          value: "2"
        }
      ]
    }
  ]);
  return env;
}
/**
 * 输入最近一次故事id
 * @param defaultId 
 * @returns 
 */
async function promptStoryId(): Promise<string> {
  const { stdout: prevCommitStr } = await run(
    'git log -n1 --pretty=format:"%s"'
  );
  const findRes = prevCommitStr.match(/[\w-]+#\d+$/);
  const prevStoryId = findRes && findRes[0];
  const { storyId } = await inquirer.prompt([
    {
      type: "input",
      message: "请输入故事id（用于保证git提交成功）",
      name: "storyId",
      default: prevStoryId
    }
  ]);
  return storyId;
}
/**
 * 更新版本号
 * @param nextVersion 新版本号
 */
async function updateVersion(nextVersion: string) {
  pkg.version = nextVersion;
  timeLog("修改package.json版本号", "start");
  await fs.writeFileSync(
    path.resolve(__dirname, "../package.json"),
    JSON.stringify(pkg)
  );
  await run("npx prettier package.json --write");
  timeLog("修改package.json版本号", "end");
}

async function release() {
  try {
    // 选择发布环境
    const buildType = await promptBrowser();
    // 升级版本号
    const nextVersion = await prompt();
    // 获取最近一次提交的故事id
    const storyId = await promptStoryId();
    await updateVersion(nextVersion);
    // 构建
    await run("yarn run changelog");
    switch (buildType) {
      case "0":
        await run("yarn run build");
        break;
      case "1":
        await run("yarn run build-cjs"); // npm
        break;
      case "2":
        await run("yarn run build-browser"); // script
        break;
    }
    if (buildType!=="1") {
      await run(`cp browser/index.min.js browser/palife-lib-wx.${nextVersion}.min.js`)
    }
    await run("tsc");
    // 推送
    await run("git add .");
    await run(`git commit -m "chore(release): ${nextVersion} ${storyId}" -n`);
    await run("git push");
    await run(`git tag v${nextVersion}`);
    await run(`git push origin tag v${nextVersion}`);
  } catch (error) {
    console.log("💣 发布失败，失败原因：", error);
  }
}

release();
