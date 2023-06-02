# Modular Connect
A modular implementation of Amazon Connect

Further details can be found in [this](http://ianchristopherryan.com/blog/2023-05-23-amazon-connect-modular-part-1/) blog post.

This is an initial simple version of the source code for this blog post, this will be updated shortly with a complete cloudformation solution with the third part of the blog post.

![alt text](https://github.com/ianchristopherryan/modular-connect/blob/main/images/module_architecture.png?raw=true)

The data folder contains the export of the data in the dynamo tables.

The Lambda folder contains the source code for the lambda functions.

The flows folder contains the Amazon Connect flows and modules.

The modular-admin folder contains the React single page app. As per usual check out this project and run npm install and npm start to test the front end. The API end points will need to be updated in the App.js.

![alt text](https://github.com/ianchristopherryan/modular-connect/blob/main/images/modular_connect_admin.png?raw=true)

