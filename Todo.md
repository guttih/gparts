# What needs to be done

### the Database values
Declare array of [Objects](https://stackoverflow.com/questions/19695058/how-to-define-object-in-array-in-mongoose-schema-correctly-with-2d-geo-index)

[Schematypes](http://mongoosejs.com/docs/schematypes.html)
##### Part
 - ID
 - Name
 - Description
 - Category
 - Model
 - Count
 - -------------------
 - Image
 - Type
 - Location
 - Supplier
 - Manufacturer
 - Urls[{Name: String, Url: String}]
 - AttachmentIds: [Schema.Types.ObjectId]

How to [save a file](https://gist.github.com/aheckmann/2408370) to mongoose.
Or do I save a path to a file on the /public/files?  How do I know if the uploaded file is a file or að image?

##### File
- ID
- Name: String
- Description: String
- file: { data: Buffer, contentType: String }

##### Type
- ID
- Name
##### Location
- ID
- Name
- Description

##### Supplier
- ID
- Name
- Description
- Url
##### Manufacturer
- ID
- Name
- Description
- Url


