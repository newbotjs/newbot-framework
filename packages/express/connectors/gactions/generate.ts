import difference from "lodash.difference";
import fs from "fs";
import path from "path";

export default function generateActionFile(gactions, url) {
  const regexp = /action\.([a-zA-Z-]+)\.json/;
  const gactionsDir = gactions.generateDir;

  if (!gactions.projectId) {
    throw 'Add "gactions.projectId" property with your Google Action project id value';
  }

  if (!gactions.triggers) {
    throw 'Add "gactions.triggers" property. Ex : { triggers : { en: "Talk with chatbot" } }';
  }

  if (!gactionsDir) {
    throw 'Add "gactions.gactionsDir" property. This is the folder where the Action files will be generated';
  }

  try {
    fs.mkdirSync(gactionsDir);
  } catch (err) {
    if (err.code != "EEXIST") throw err;
  }

  const actionFiles = () =>
    fs.readdirSync(gactionsDir).filter((filename) => regexp.test(filename));

  const arrayFiles = actionFiles().map(
    (filename: any) => filename.match(regexp)[1]
  );
  const fileToCreate = difference(Object.keys(gactions.triggers), arrayFiles);

  if (fileToCreate.length != 0) {
    for (let lang of fileToCreate) {
      const json = {
        actions: [
          {
            description: "Default Intent",
            name: "MAIN",
            fulfillment: {
              conversationName: "newbot",
            },
            intent: {
              name: "actions.intent.MAIN",
              trigger: {
                queryPatterns: gactions.triggers[lang],
              },
            },
          },
        ],
        conversations: {
          newbot: {
            name: "newbot",
            url: "<URL>",
          },
        },
        locale: lang,
      };
      fs.writeFileSync(
        `${gactionsDir}/action.${lang}.json`,
        JSON.stringify(json, null, 2),
        "utf-8"
      );
    }
  }

  let actionPackages = "";
  actionFiles().forEach((filename) => {
    const file = path.join(gactionsDir, filename);
    let json: any = fs.readFileSync(file, "utf-8");
    json = JSON.parse(json);
    json.conversations.newbot.url = url;
    fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf-8");
    actionPackages += " --action_package " + file;
  });

  return `./gactions update ${actionPackages} --project ${gactions.projectId}`;
}
