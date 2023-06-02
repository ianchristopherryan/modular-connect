export const handler = async(event) => {
    console.log(JSON.stringify(event));
    
    let moduleListConfiguration = JSON.parse(event.Details.Parameters.internal_module_list_configuration);
    let lastModuleId = event.Details.Parameters.internal_module_executor_last_module_id;
    
    //the next module to execute
    let module = moduleListConfiguration.modules[0];
    if(lastModuleId){
        module = getNextObject(moduleListConfiguration.modules, lastModuleId);
    }
    
    if(module === null){
        return {
            internal_module_executor_action: "stop"
        }
    } else {
        return {
             internal_module_executor_arn: module.arn,
             internal_module_executor_settings: JSON.stringify(module.settings),
             internal_module_executor_last_module_id: module.id,
             internal_module_executor_module_exit_action: module.exitAction,
             internal_module_executor_module_exit_action_value: module.exitActionValue,
             internal_module_executor_action: "continue",
        };
    }
    
    
};

function getNextObject(jsonArray, objectId) {
  const index = jsonArray.findIndex(obj => obj.id === objectId);
  
  if (index !== -1 && index < jsonArray.length - 1) {
    return jsonArray[index + 1];
  }

  return null; // If the ID is not found or it's the last object in the array
}
