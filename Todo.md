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

##### Attachment
- ID
- Name: String
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


