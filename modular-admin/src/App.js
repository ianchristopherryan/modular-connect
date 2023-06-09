import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { DistributeVertical, CardText, Trash} from 'react-bootstrap-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState([]);
  const [isChanged, setIsChanged] = useState(false);

  const [moduleDescriptors, setModuleDescriptors] = useState([]);

  const [editModule, setEditModule] = useState([]);
  const [editModuleIndex, setEditModuleIndex] = useState(0);
  const [editDescriptor, setEditDescriptor] = useState([]);

  const [moduleAdded, setModuleAdded] = useState(false);

  const [editModuleModalShow, setEditModuleModalShow] = React.useState(false);
  const [newConfigurationModalShow, setNewConfigurationModalShow] = React.useState(false);
  const [confirmDeleteModalShow, setConfirmDeleteModalShow] = React.useState(false);

  const modulesRef = useRef([]);

  const [userName, setUserName] = React.useState("");

  const [login, setLogin] = React.useState(true);
  const [loginUsername, setLoginUsername] = React.useState();
  const [loginPassword, setLoginPassword] = React.useState();

  let newConfig = {
    phoneNumber: "",
    name: ""
  }

  useEffect(() => {
    loadConfigurations(true);
    loadModuleDescriptors();
  }, []);


  useEffect(() => {
    if (selectedConfiguration && selectedConfiguration.modules & moduleAdded) {
      let ref = modulesRef.current[selectedConfiguration.modules.length - 1];
      ref.scrollIntoView();
      setModuleAdded(false);
    }

  }, [selectedConfiguration, moduleAdded]);

  //load the config, if first is true then it will set the first config active
  function loadConfigurations(first) {
    fetch("https://APIPATH.execute-api.ap-southeast-2.amazonaws.com/Test/configurations")

      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setConfigurations(result);
          if (first) {
            setSelectedConfiguration(result[0]);
          }
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }

  function loadModuleDescriptors() {
    fetch("https://APIPATH.execute-api.ap-southeast-2.amazonaws.com/Test/modules")
      .then(res => res.json())
      .then(
        (result) => {
          setModuleDescriptors(result);
        },
        (error) => {
          setError(error);
        }
      );
  }

  function updateConfiguration() {
    setIsChanged(false);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedConfiguration.id,
        phoneNumber: selectedConfiguration.phoneNumber,
        modules: selectedConfiguration.modules,
        name: selectedConfiguration.name
      })
    };

    fetch('https://APIPATH.execute-api.ap-southeast-2.amazonaws.com/Test/configurations', requestOptions)
      .then(response => response.json())
      .then(
        (result) => {
          loadConfigurations();
        });
  }

  function deleteConfiguration() {
    setIsChanged(false);
    setConfirmDeleteModalShow(false);
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    };

    fetch('https://APIPATH.execute-api.ap-southeast-2.amazonaws.com/Test/configurations/' + selectedConfiguration.id, requestOptions)
      .then(response => response.json())
      .then(
        (result) => {
          loadConfigurations(true);
        });
  }

  function newConfiguration() {
    setIsChanged(false);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: uuidv4(),
        phoneNumber: newConfig.phoneNumber,
        modules: [],
        name: newConfig.name
      })
    };

    fetch('https://APIPATH.execute-api.ap-southeast-2.amazonaws.com/Test/configurations', requestOptions)
      .then(response => response.json())
      .then(
        (result) => {
          loadConfigurations();
        });
  }

  function createNewModule(key) {
    setModuleAdded(true);
    let descriptor = moduleDescriptors[parseInt(key.split("-")[1])];
    const newModule = {
      id: uuidv4(),
      name: descriptor.name,
      arn: descriptor.arn,
      description: descriptor.description,
      settings: descriptor.defaultSettings
    }

    descriptor.settings.forEach(v => {
      if (v.pair) {
        if (v.pair[0].default) {
          newModule.settings[v.pair[0].name] = v.pair[0].default;
        }
        if (v.pair[1].default) {
          newModule.settings[v.pair[1].name] = v.pair[1].default;
        }
      }
      if (v.default) {
        newModule.settings[v.name] = v.default;
      }
    });

    let newModules = selectedConfiguration.modules.concat([newModule]);
    setSelectedConfiguration({ ...selectedConfiguration, modules: newModules });
    setIsChanged(true);
  }



  //handler for the main menu
  function handleSelect(key) {
    if (key.startsWith("new")) {
      newConfig.phoneNumber = availableNumbers[0];
      displayNewConfigurationModuleModal();
    }

    if (key.startsWith("config")) {
      setSelectedConfiguration(configurations[parseInt(key.split("-")[1])]); 
      setIsChanged(false);
    }

    //add a new module
    if (key.startsWith("moduleDescriptor")) {
      createNewModule(key);
    }

  }

  //displays the edit modal
  function displayEditModuleModal(index) {
    setEditModuleModalShow(true);
    setEditModule({ ...selectedConfiguration.modules[index] });
    setEditModuleIndex(index);
    setEditDescriptor(getDescriptor(selectedConfiguration.modules[index].name));
  }

  //displays the new configuration module 
  function displayNewConfigurationModuleModal() {
    setNewConfigurationModalShow(true);
  }

  //Gets the descriptor with the given name
  function getDescriptor (name) {
    return moduleDescriptors.find((element) => {
      return element.name === name;
    })
  }

  //Converts the text to title text
  function toTitleText(text) {
    if (text) {
      const result = '' + text.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return '';
  }

  //handle the on drag function
  function handleOnDragEnd(result) {
    if (!result.destination) return;
    const items = Array.from(selectedConfiguration.modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    selectedConfiguration.modules = items;
    setIsChanged(true);
  }

  function onLoginSubmit() {
    if (loginPassword === "admin") {
      setUserName(loginUsername);
      setLogin(false);
    }
  }


  if (login) {
    return <div className="Auth-form-container">
      <form className="Auth-form">
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign In</h3>
          <div className="form-group mt-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control mt-1"
              placeholder="Enter username"
              onChange={(e) => {
                setLoginUsername(e.target.value);
              }
              }
            />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control mt-1"
              placeholder="Enter password"
              onChange={(e) => {
                setLoginPassword(e.target.value);
              }
              }
            />
          </div>

          <div className="d-grid gap-2 mt-3">
            <Button onClick={() => onLoginSubmit()} onKeyPress={(event) => { if (event.key === "Enter") onLoginSubmit() }} className="btn btn-primary">
              Submit </Button>
          </div>
        </div>
      </form>
    </div>
  } else if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
  <>
  <Navbar expand="lg" variant="dark" bg="dark" fixed="top" >
    <Container>
      <Navbar.Brand href="#">AnyCompany</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          Signed in as: {userName}
        </Navbar.Text>
      </Navbar.Collapse> 
    </Container>
  </Navbar>
  

  <div className="module-container">
    <div className="square border">
      <Navbar bg="light">
        <Container>
          <Navbar.Brand href="#home">Configuration Editor</Navbar.Brand> 
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav onSelect={handleSelect} className="me-auto">
              <Nav.Link eventKey="new">New Configuration</Nav.Link> 
              <NavDropdown title="Select configuration" id="basic-nav-dropdown">
                {configurations.map((config, index) => {
                  return (
                    <NavDropdown.Item key={"config-" + index} eventKey={"config-" + index}>{config.name}</NavDropdown.Item>
                  )})
                }
              </NavDropdown>
              <NavDropdown title="Add Module" id="basic-nav-dropdown"> 
              {moduleDescriptors && moduleDescriptors.map((moduleDescriptor, index) => {
                return (
                  <NavDropdown.Item key={"moduleDescriptor-" + index} eventKey={"moduleDescriptor-" + index}>{toTitleText (moduleDescriptor.name)}</NavDropdown.Item>
                )})
              }
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

{ selectedConfiguration && selectedConfiguration.modules &&
  <>
    <div className=" configuration-details">
      <div>
        <h3>{selectedConfiguration.name}</h3>
        ({selectedConfiguration.phoneNumber})
      </div> 
      <div className="configuration-menu">
        <div className= 'configuration-menu-button' >
          <Button variant="danger" onClick={() => setConfirmDeleteModalShow(true)}>Delete</Button>
        </div>
        {isChanged && <div className='configuration-menu-button' >
          <Button disabled={!isChanged} onClick={updateConfiguration}>Save</Button> 
        </div>}
      </div> 
    </div>

    <div className='module-list-area'>
      <div className="module-list-container">
        <h6>Module List</h6>
        <small>These are the modules that will be executed in order as part of this configuration</small>
        <hr/>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="modules">
            {(provided) => (
              <ul className="modules" {...provided.droppableProps} ref={provided.innerRef}>
                {selectedConfiguration.modules && selectedConfiguration.modules.map(({id, name, description}, index) => {
                  return (
                  <Draggable key={id} draggableId={"draggableId-" + id + index} index={index}>
                  {(provided) => (
                    <li ref={provided.innerRef} {...provided.draggableProps} >
                        <div ref={el => modulesRef.current[index] = el} className="module-header">
                          <div className="module-handle" {...provided.dragHandleProps}>
                            <DistributeVertical/> 
                          </div>
                          <div className="module-title">{toTitleText (name)}</div> 
                          <div className="module-edit"> 
                            <span>
                              <Trash className="delete-button" onClick={() => {
                                let newModules = Array.from (selectedConfiguration.modules);
                                newModules.splice(index, 1);
                                setSelectedConfiguration({...selectedConfiguration, modules: newModules});
                                setIsChanged (true)
                              }}/>
                              &nbsp;
                              <CardText className="edit-button" onClick={() => {
                                displayEditModuleModal(index);
                              }}/>
                            </span> 
                          </div> 
                        </div>
                        <hr/>
                        <div className="module-details-container">
                          <div className="module-details-column a">
                          {selectedConfiguration.modules[index].description && <div><span className="small-text-bold">Description: </span><span className="small-text">{selectedConfiguration.modules[index].description}</span></div>}
                            {Object.entries (selectedConfiguration.modules[index].settings).map(([key, value], index) => {
                              return (
                                <div key={key+index} ><span className="small-text-bold">{toTitleText(key)}: </span><span className="small-text">{value}</span></div>
                              )
                            }
                          )}
                          </div>
                          <div className="module-details-column b">
                            {selectedConfiguration.modules[index].exitAction && <div><span className="small-text-bold">Exit Action: </span><span className="small-text">{selectedConfiguration.modules[index].exitAction}</span></div>}
                            {selectedConfiguration.modules[index].exitActionValue && <div><span className="small-text-bold">Exit Action Value: </span><span className="small-text">{selectedConfiguration.modules[index].exitActionValue}</span></div>}
                            {selectedConfiguration.modules[index].condition && <div><span className="small-text-bold">Condition: </span><span className="small-text">{selectedConfiguration.modules[index].condition}</span></div>}
                          </div>
                        </div> 
                    </li>
                  )}
                  </Draggable>
                  )
                })}
                {provided.placeholder} 
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div> 
    </div>
  </>
}

<EditModuleModal 
  show={editModuleModalShow}
  onHide={() => setEditModuleModalShow(false)}
/>

<NewConfigurationModal 
  show={newConfigurationModalShow}
  onHide={() => setNewConfigurationModalShow(false)}
/>

<ConfirmDeleteModal
  show={confirmDeleteModalShow}
  onHide={() => setConfirmDeleteModalShow(false)}
/>

</div> 
</div>
</>
);
  }

function NewConfigurationModal(props) {
  return (
    <Modal
      {...props} 
      size="lg" 
      aria-labelledby="contained-modal-title-venter" 
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
        Create New Configuration
        </Modal.Title> 
      </Modal.Header> 
      <Modal.Body>
        <h4>Settings</h4>
        <Form>
          <Form.Group className="mb-3" controlId="phoneNumber" key="phoneNumber">
            <Form.Label>Phone Number</Form.Label>

            <Form.Control onChange={(e) => {
                newConfig.phoneNumber = e.target.value;
              }
            } type="text" />
            <Form.Text className="text-muted">The phone number for this configuration.</Form.Text> 
          </Form.Group>
          <Form.Group className="mb-3" controlId="name" key="name">
            <Form.Label>Name</Form.Label>
            <Form.Control onChange={(e) => {
                newConfig.name = e.target.value;
              }
            } type="text" />
            <Form.Text className="text-muted">The name of this new configuration.</Form.Text> 
          </Form.Group>
        </Form>

      </Modal.Body> 
      <Modal.Footer>
        <Button onClick={() => {
          if (!newConfig.phoneNumber) {
            newConfig.phoneNumber = availableNumbers[0];
          }
          newConfiguration();
          setNewConfigurationModalShow(false);
        }
        }>Create</Button>
      </Modal.Footer> 
    </Modal>
    );
  }

  function ConfirmDeleteModal(props) {
    return (
      <Modal 
        {...props} 
        size="lg" 
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >

        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
          Confirm Delete 
          </Modal.Title> 
        </Modal.Header> 
        <Modal.Body>
          <p>Are you sure you want to delete {selectedConfiguration && selectedConfiguration.name}</p>
        </Modal.Body> 
        <Modal.Footer> 
          <Button onClick={props.onHide}>Close</Button>
          <Button variant="danger" onClick={() => {
            deleteConfiguration()
            }
          }>Delete</Button>
        </Modal.Footer> 
      </Modal >
    );
  }

  function EditModuleModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-venter">
            {editModule.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{editDescriptor.description}</p>
          <h4>Settings</h4>
          <Form>
            <Form.Group className="mb-3" controlId="description" key="description">
              <Form.Label>Description</Form.Label>
              <Form.Control onChange={(e) => {
                editModule.description = e.target.value;
                }
              } type="text" defaultValue={editModule.description}/>
              <Form.Text className="text-muted">A description of this module.</Form.Text>
            </Form.Group>
            {editDescriptor.settings && editDescriptor.settings.map((desc, index) => {
              return (
                <React.Fragment key={"desc" + index}>
                  {desc.pair &&
                    <Row className="mb-3">
                      <Col>
                        {moduleSettingsField(index, desc.pair[0])}
                      </Col>
                      <Col>
                        {moduleSettingsField(index, desc.pair[1])}
                      </Col>
                    </Row>
                  }
                  {!desc.pair && moduleSettingsField(index, desc)}
                </React.Fragment>
              )
              })
            }
            <Accordion>
              <Accordion.Item eventkey="0">
                <Accordion.Header>Module Advanced Settings</Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3" controlId="action" key="action">
                    <Form.Label>Exit Action</Form.Label>
                    <Form.Select onChange={(e) => {
                      editModule.exitAction = e.target.value;
                    }
                    } defaultValue={editModule.exitAction}>
                      <option value="none" key='select-none' >None</option>
                      <option value="hangup" key='hangup-none' >Hangup</option>
                      <option value="transferQueue" key='transferQueue-none' >Transfer to Queue</option>
                      <option value="transferWorkingQueue" key='transferWorkingQueue-none' >Transfer to Working Queue</option>
                      <option value="transferNumber" key='transferNumber-none' >Transfer to Number</option>
                    </Form.Select>
                    <Form.Text className="text-muted">The exit action that will be performed when this module completes.</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="action-target" key="action-target">
                    <Form.Label>Exit Action Value</Form.Label>
                    <Form.Control onChange={(e) => {
                      editModule.exitActionValue = e.target.value;
                    }
                    } type="text" defaultValue={editModule.exitActionValue} />
                  </Form.Group>
                  <Form.Text className="text-muted">An optional exit action value. Used when the exit action is set to a transfer option.</Form.Text>
                  <Form.Group className="mb-3" controlId="condition" key="condition">
                    <Form.Label>Condition</Form.Label>
                    <Form.Control onChange={(e) => {
                      editModule.condition = e.target.value;
                    }
                    } type="text" defaultValue={editModule.condition} />
                  </Form.Group>
                  <Form.Text className="text-muted">The condition that will be evaluated to decide if this module is executed. No condition or 'true' will mean the module is executed.</Form.Text>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => {
            selectedConfiguration.modules[editModuleIndex] = editModule;
            // setSelectedConfiguration ({...selectedConfiguration, modules: newModules});
            props.onHide();
            setIsChanged(true);
          }
          }>Apply</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function moduleSettingsField(index, desc) {
    return <Form.Group className="mb-3" controlId={index} key={index}>
      <Form.Label>{toTitleText(desc.name)}{desc.required && "*"}</Form.Label>
      {desc.type === "text" &&
        <Form.Control onChange={(e) => {
          editModule.settings[desc.name] = e.target.value;
        }} type="text" defaultValue={editModule.settings[desc.name]} />}
      {desc.type === "select" &&
        <>
          <Form.Select onChange={(e) => {
            editModule.settings[desc.name] = e.target.value;
            } } defaultValue={editModule.settings[desc.name]} aria-label="Default select example">
              {desc.options.map((opt, index) => {
                return (<option value = {opt} key = {'select' + desc.name + index }>{opt}</option>);
            })}
          </Form.Select>
        </>}
      <Form.Text className="text-muted">{desc.description}</Form.Text>
    </Form.Group >;
  }
  
}

export default App;