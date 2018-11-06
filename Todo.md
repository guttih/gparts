# What needs to be done

## Part Register & modify
Ætli ég þurfi ekki að kalla bara á 
rútuna      router.post('/register/image', lib.authenticateAdminRequest, function (req, res, next) {
úr rútunni  router.post('/register', lib.authenticateAdminRequest, function(req, res){
og gefa function sem parameter í next

fyrst þarf ég þó að laga rútuna /register/image' þannig að hún kalli á next sé hún gefin




I think I will need to make two different pages for register and modify a part.
This is because I will need to be able upload files for the first time when registering a new part.
But delete and add files when modifying a part.
### Register new Part
  - Will not be able to upload files here.
  - Only set base properties of the part object.  Those properties are
    * name
    * description
    * Category
    * image selected will be a default part image

### Modify Part
 - Will need to be able to select a file already stored in the database.
 - Will need to be able to upload a new file not stored in the database.
   * this means that when press new file then a new dialog takes the focus over the part modify page
   * how to search for and select a already stored file
   * how to search for and select a already stored image in the database


   

