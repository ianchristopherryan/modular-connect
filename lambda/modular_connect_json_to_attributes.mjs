export const handler = async(event) => {
    return addPrefixToKeys(JSON.parse(event.Details.Parameters.jsonString), "module_setting_");
};

function addPrefixToKeys(jsonObject, prefix) {
  const result = {};

  for (const key in jsonObject) {
    if (jsonObject.hasOwnProperty(key)) {
      const newKey = `${prefix}${key}`;
      result[newKey] = jsonObject[key];
    }
  }

  return result;
}