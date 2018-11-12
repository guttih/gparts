# What needs to be done
 
## Part Register & modify

 - files and are allowed to be added when part is in edit mode


### Modify Part
 - Will need to be able to select a file already stored in the database.
 - Will need to be able to upload a new file not stored in the database.
   * this means that when press new file then a new dialog takes the focus over the part modify page
   * how to search for and select a already stored image in the database
   * how to search for and select a already stored file in the database

### files and images
 - Do not Create a File object before you are sure that the file was saved to disk
 
### Delete button missing when
 - Modify Part
   * Delete part must also delete part image and all part files
 - Modify Manufacturer
 - Modify Supplier
 - Modify Location
 - Modify Type
 - Modify user

   
### minor bugs
 - Part modify page
   -  Þegar þú Smellir mynda takkann Delete Þá eyðir þú myndinni, en ég held að imageId verði eftir í partinum, því on hover þá koma view og delete takkarnir þó svo myndin sé ekki til í File né á disk