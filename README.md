# Tool Bar GUI for Atom.io

I rewrote this package almost completely since the initial implementation had such an awful lot of errors and problems. Now they're fixed and this package is actually working really well.

A graphic user interface for managing [tool-bar](http://atom.io/packages/tool-bar) items. 

Requires the [tool-bar](http://atom.io/packages/tool-bar) package. 


## Features

Currently this package provides tools for
* __Adding__ and __editing__ the toolbar items
* __Ordering__ of the added toolbar items; and 
* __Removing__ items from the tool bar.


## Available onClick commands

The package provides a view for adding & editing a tool bar item.
The view introduces a text editor for writing the callback command to be assigned to the edited item as a click event handler.

One may choose to populate the callback command editor with either of the following:

* Any command that has been registered to atom may be typed to dispatch that command upon clicking the event; e.g.

  ```
  application:open-file
  ```

* Alternatively, any ecmascript snippet may be written:
  ```javascript
  function niccce (editor) {
    editor.getTitle = () => "Mkay";
  }

  // The atom namespace is available in the callback commands as they are executed within
  // the context of the editor:
  atom.workspace.getActiveTextEditor(niccce)
  ```


## Features

Currently this package provdes panels for
`adding`items to the tool bar and `removing` items from the tool bar. 

Future updates will introduce tools for editing existing entries and ordering of items.
