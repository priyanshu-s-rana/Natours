class API_Features {
    constructor(query,queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
         //! Filtering.
         const queryObj = {...this.queryString};
         const excluded_fields= ['page','sort','limit','fields'];
         excluded_fields.forEach(el=>delete queryObj[el])
         
         //! Advanced Filtering
         let query_str = JSON.stringify(queryObj);
         query_str= query_str.replace(/\b(gte|gt|lte|lt)\b/g, match=> `$${match}`); // Using a regular expression
         //console.log(JSON.parse(query_str));
         
         //console.log(queryObj);
        this.query =  this.query.find(JSON.parse(query_str));
         return this;
    }

    sort(){
          //! Sorting
        if(this.queryString.sort){
            this.query = this.query.sort(this.queryString.sort.replace(/,/g,' '));
        }else{
            this.query = this.query.sort('-createdAt');
        }
        return this; // ! To return the object so that we can chain the methods
    }

    limitFields(){
        //! Field Limiting or projection
        if(this.queryString.fields){
            const fields = this.queryString.fields.replace(/\b,\b/g,' '); //* Again using a regexp
            //const fields = req.query.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v'); // Excluding.
        }
        return this;
    }

    paginate(){
        const page = this.queryString.page*1 || 1;
        const limit = this.queryString.limit*1 || 100;
        // skip(n)--> skip "n" documents. so to enter the next page with limit(x), have to skip(x) {skipping x pages}
        // page = 2& limit=10 --> 1-10 (1st page) , 11-20 (2nd page). skip --> 10 to enter the 11th doc
        this.query = this.query.skip(limit*(page-1)).limit(limit);
        return this;
    }
}

module.exports = API_Features;