# What needs to be done

### the Database values
Declare array of [Objects](https://stackoverflow.com/questions/19695058/how-to-define-object-in-array-in-mongoose-schema-correctly-with-2d-geo-index)

[Schematypes](http://mongoosejs.com/docs/schematypes.html)
##### Part
 - ID
 - Name
 - Image
 - Description
 - Category
 - Location
 - Supplier
 - Manufacturer
 - Model
 - Attachments[]

##### Attachment
- ID
- Name: String
- file: { data: Buffer, contentType: String }

##### Url
- ID
- Name: String
- Url: String
##### Type
- ID
- Name
##### Location
- ID
- Name
- Description

##### Supplier
- ID
- Company
- Name
- WebPage
- Notes


