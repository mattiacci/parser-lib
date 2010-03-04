/* 
Copyright (c) 2009 Nicholas C. Zakas. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

/**
 * A generic base to inherit from for any object
 * that needs event handling.
 * @class EventTarget
 * @constructor
 */
function EventTarget(){

    /**
     * The array of listeners for various events.
     * @type Object
     * @property _listeners
     * @private
     */
    this._listeners = {};    
}

EventTarget.prototype = {

    //restore constructor
    constructor: EventTarget,

    /**
     * Adds a listener for a given event type.
     * @param {String} type The type of event to add a listener for.
     * @param {Function} listener The function to call when the event occurs.
     * @return {void}
     * @method addListener
     */
    addListener: function(type, listener){
        if (typeof this._listeners[type] == "undefined"){
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    },
    
    /**
     * Fires an event based on the passed-in object.
     * @param {Object|String} event An object with at least a 'type' attribute
     *      or a string indicating the event name.
     * @return {void}
     * @method fire
     */    
    fire: function(event){
        if (typeof event == "string"){
            event = { type: event };
        }
        if (!event.target){
            event.target = this;
        }
        
        if (!event.type){
            throw new Error("Event object missing 'type' property.");
        }
        
        if (this._listeners[event.type] instanceof Array){
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(this, event);
            }
        }            
    },

    /**
     * Removes a listener for a given event type.
     * @param {String} type The type of event to remove a listener from.
     * @param {Function} listener The function to remove from the event.
     * @return {void}
     * @method removeListener
     */
    removeListener: function(type, listener){
        if (this._listeners[type] instanceof Array){
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    break;
                }
            }
            
            listeners.splice(i, 1);
        }            
    }
};
/**
 * Convenient way to read through strings.
 * @class StringReader
 * @constructor
 * @param {String} text The text to read.
 */
function StringReader(text){
    
    /**
     * The input text with line endings normalized.
     * @property _input
     * @type String
     * @private
     */
    this._input = text.replace(/\n\r?/g, "\n");
    
    
    /**
     * The row for the character to be read next.
     * @property _row
     * @type int
     * @private
     */
    this._row = 1;
    
    
    /**
     * The column for the character to be read next.
     * @property _col
     * @type int
     * @private
     */
    this._col = 1;
    
    /**
     * The index of the character in the input to be read next.
     * @property _cursor
     * @type int
     * @private
     */    
    this._cursor = 0;
}

StringReader.prototype = {

    //restore constructor
    constructor: StringReader,
        
    //-------------------------------------------------------------------------
    // Position info
    //-------------------------------------------------------------------------
    
    /**
     * Returns the column of the character to be read next.
     * @return {int} The column of the character to be read next.
     * @method getCol
     */
    getCol: function(){
        return this._col;
    },
    
    /**
     * Returns the row of the character to be read next.
     * @return {int} The row of the character to be read next.
     * @method getRow
     */    
    getRow: function(){
        return this._row ;
    },
    
    /**
     * Determines if you're at the end of the input.
     * @return {Boolean} True if there's no more input, false otherwise.
     * @method eof
     */    
    eof: function(){
        return (this._cursor == this._input.length)
    },
    
    //-------------------------------------------------------------------------
    // Basic reading
    //-------------------------------------------------------------------------
    
    /**
     * Reads the next character from the input and adjusts the row and column
     * accordingly.
     * @return {String} The next character or null if there is no next character.
     * @method read
     */
    read: function(){
        var c = null;
        
        //if we're not at the end of the input...
        if (this._cursor < this._input.length){
        
            //if the last character was a newline, increment row count
            //and reset column count
            if (this._input.charAt(this._cursor) == "\n"){
                this._row++;
                this._col=1;
            } else {
                this._col++;
            }
        
            //get character and increment cursor and column
            c = this._input.charAt(this._cursor++);
        }
        
        return c;
    },
       
    //-------------------------------------------------------------------------
    // Advanced reading
    //-------------------------------------------------------------------------
    
    /**
     * Reads up to and including the given string. Throws an error if that
     * string is not found.
     * @param {String} pattern The string to read.
     * @return {String} The string when it is found.
     * @throws Error when the string pattern is not found.
     * @method readTo
     */       
    readTo: function(pattern){
    
        var buffer = "",
            c;

        /*
         * First, buffer must be the same length as the pattern.
         * Then, buffer must end with the pattern or else reach the
         * end of the input.
         */
        while (buffer.length < pattern.length || buffer.lastIndexOf(pattern) != buffer.length - pattern.length){
            c = this.read();
            if (c){
                buffer += c;
            } else {
                throw new Error("Expected \"" + pattern + "\" at line " + this._row  + ", col " + this._col + ".");
            }
        }
        
        return buffer;
    
    },
    
    /**
     * Reads characters while each character causes the given
     * filter function to return true. The function is passed
     * in each character and either returns true to continue
     * reading or false to stop.
     * @param {Function} filter The function to read on each character.
     * @return {String} The string made up of all characters that passed the
     *      filter check.
     * @method readWhile
     */           
    readWhile: function(filter){
        
        var buffer = "",
            c = this.read();
        
        while(c !== null && filter(c)){
            buffer += c;
            c = this.read();
        }
        
        return buffer;
    
    },
    
    /**
     * Reads characters that match either text or a regular expression and
     * returns those characters. If a match is found, the row and column
     * are adjusted; if no match is found, the reader's state is unchanged.
     * reading or false to stop.
     * @param {String|RegExp} matchter If a string, then the literal string
     *      value is searched for. If a regular expression, then any string
     *      matching the pattern is search for.
     * @return {String} The string made up of all characters that matched or
     *      null if there was no match.
     * @method readMatch
     */               
    readMatch: function(matcher){
    
        var source = this._input.substring(this._cursor),
            value = null;
        
        //if it's a string, just do a straight match
        if (typeof matcher == "string"){
            if (source.indexOf(matcher) === 0){
                value = this.readCount(matcher.length); 
            }
        } else if (matcher instanceof RegExp){
            if (matcher.test(source)){
                value = this.readCount(RegExp.lastMatch.length);
            }
        }
        
        return value;        
    },
    
    
    /**
     * Reads a given number of characters. If the end of the input is reached,
     * it reads only the remaining characters and does not throw an error.
     * @param {int} count The number of characters to read.
     * @return {String} The string made up the read characters.
     * @method readCount
     */                   
    readCount: function(count){
        var buffer = "";
        
        while(count--){
            buffer += this.read();
        }
        
        return buffer;
    }

};
/**
 * Generic TokenStream providing base functionality.
 * @class TokenStream
 * @constructor
 * @param {String|StringReader} input The text to tokenize or a reader from 
 *      which to read the input.
 * @param {Array} tokenData An array of token data information created by
 *      TokenStream.createTokenData();
 */
function TokenStream(input, tokenData){

    /**
     * The string reader for easy access to the text.
     * @type StringReader
     * @property _reader
     * @private
     */
    this._reader = (typeof input == "string") ? new StringReader(input) : input;
    
    /**
     * Token object for the last consumed token.
     * @type Token
     * @property _token
     * @private
     */
    this._token = null;    
    
    /**
     * The array of token information.
     * @type Array
     * @property _tokenData
     * @private
     */
    this._tokenData = tokenData;
    
    /**
     * Lookahead token buffer.
     * @type Array
     * @property _lt
     * @private
     */
    this._lt = [];
    
    /**
     * Lookahead token buffer index.
     * @type int
     * @property _ltIndex
     * @private
     */
    this._ltIndex = -1;
}

/**
 * Accepts an array of token information and outputs
 * an array of token data containing key-value mappings
 * and matching functions that the TokenStream needs.
 * @param {Array} tokens An array of token descriptors.
 * @return {Array} An array of processed token data.
 * @method createTokenData
 * @static
 */
TokenStream.createTokenData = function(tokens){

    var tokenData   = [],
        tokenDatum,
        i           = 0,
        len         = tokens.length;
        
    //push EOF token to the front
    tokenData.push({ 
        name:   "EOF", 
        match:  function(reader){ 
                    return reader.eof() ? " " : null;
                }
    });
        
    tokenData.EOF = 0;
    
    while (i < len){
    
        //create a copy of the token info
        tokenDatum = {
            name:       tokens[i].name,
            hide:       tokens[i].hide,
            text:       tokens[i].text,
            pattern:    tokens[i].pattern,
            patternOpt: tokens[i].patternOpt,
            match:      tokens[i].match
        };
        
        //store token type values by name for easy reference
        tokenData[tokenDatum.name] = i+1;
        
        //create match functions for each tokenInfo object
        if (typeof tokenDatum.text == "string"){
            tokenDatum.match = function(reader){
                return reader.readMatch(this.text);
            };
        } else if (typeof tokenDatum.pattern == "string"){
            tokenDatum.match = function(reader){
                return reader.readMatch(new RegExp("^(?:" + this.pattern + ")", this.patternOpt));
            };            
        }
        
        i++;

        tokenData.push(tokenDatum);
    }        

    return tokenData;
};


TokenStream.prototype = {

    //restore constructor
    constructor: TokenStream,    
    
    //-------------------------------------------------------------------------
    // Matching methods
    //-------------------------------------------------------------------------
    
    /**
     * Determines if the next token matches the given token type.
     * If so, that token is consumed; if not, the token is placed
     * back onto the token stream. You can pass in any number of
     * token types and this will return true if any of the token
     * types is found.
     * @param {int} tokenType The code for the token type to check.
     * @return {Boolean} True if the token type matches, false if not.
     * @method match
     */
    match: function(){
        var tt  = this.get(),
            i   = 0,
            len = arguments.length;
            
        while(i < len){
            if (tt == arguments[i++]){
                return true;
            }
        }
        
        //no match found, put the token back
        this.unget();
        return false;
    },    
    
    /**
     * Determines if the next token matches the given token type.
     * If so, that token is consumed; if not, an error is thrown.
     * @param {int} tokenType The code for the token type to check.
     * @return {void}
     * @method mustMatch
     */    
    mustMatch: function(tokenType){
        var i       = 0,
            len     = arguments.length,
            matched = false,
            token;

        if (!this.match.apply(this, arguments)){    
            token = this.LT(1);
            throw new Error("Expected " + this._tokenData[tokenType].name + 
                " at line " + token.startRow + ", character " + token.startCol + ".");
        }
    },
    
    //-------------------------------------------------------------------------
    // Consuming methods
    //-------------------------------------------------------------------------
    
    /**
     * Consumes the next token from the token stream. 
     * @return {int} The token type of the token that was just consumed.
     * @method get
     */      
    get: function(){
    
        var tokenInfo   = this._tokenData,
            reader      = this._reader,
            startCol    = reader.getCol(),
            startRow    = reader.getRow(),
            value,
            i           =0,
            len         = tokenInfo.length,
            found       = false,
            token       = { startCol: reader.getCol(), startRow: reader.getRow() };
            
        //check the lookahead buffer first
        if (this._lt.length && this._ltIndex >= 0 && this._ltIndex < this._lt.length){            
            this._token = this._lt[this._ltIndex++];            
            return this._token.type;
        }
        
        //test each token pattern from top to bottom
        while (i < len && !found){    
        
            //wrap in try-catch to help debug tokenInfo errors
            try {
                value = tokenInfo[i].match(reader);
            } catch (ex){
                throw new Error("Error in token info for " + tokenInfo[i].name + ": " + ex.message);
            }
            
            //if there's a value, break the loop, otherwise continue
            if (value){
                found = true;
            } else {
                i++;
            }
        }
        
        token.endCol = reader.getCol();
        token.endRow = reader.getRow();
        
        if (found){
            token.type = i;
            token.value = value;
        } else {
            token.type = -1;
            token.value = reader.read();
        }
        
        //if the token should be hidden, call get() again
        if (tokenInfo[token.type] && tokenInfo[token.type].hide){
            return this.get();
        } else {
        
            //save for later
            this._token = token;
            this._lt.push(token);
            
            //keep the buffer under 5 items
            if (this._lt.length > 15){
                this._lt.shift();
            }

            //update lookahead index
            this._ltIndex = this._lt.length;
            
            //return just the type
            return token.type;
        }
    },
    
    /**
     * Looks ahead a certain number of tokens and returns the token type at
     * that position. This will throw an error if you lookahead past the
     * end of input, past the size of the lookahead buffer, or back past
     * the first token in the lookahead buffer.
     * @param {int} The index of the token type to retrieve. 0 for the
     *      current token, 1 for the next, -1 for the previous, etc.
     * @return {int} The token type of the token in the given position.
     * @method LA
     */
    LA: function(index){
        var total = index,
            tt;
        if (index > 0){
            //TODO: Store 15 somewhere
            if (index > 15){
                throw new Error("Too much lookahead.");
            }
        
            //get all those tokens
            while(total){
                tt = this.get();   
                total--;                            
            }
            
            //unget all those tokens
            while(total < index){
                this.unget();
                total++;
            }
        } else if (index < 0){
        
            if(this._lt[this._ltIndex+index]){
                tt = this._lt[this._ltIndex+index].type;
            } else {
                throw new Error("Too much lookbehind.");
            }
        
        } else {
            tt = this._token.type;
        }
        
        return tt;
    
    },
    
    /**
     * Looks ahead a certain number of tokens and returns the token at
     * that position. This will throw an error if you lookahead past the
     * end of input, past the size of the lookahead buffer, or back past
     * the first token in the lookahead buffer.
     * @param {int} The index of the token type to retrieve. 0 for the
     *      current token, 1 for the next, -1 for the previous, etc.
     * @return {Object} The token of the token in the given position.
     * @method LA
     */    
    LT: function(index){
    
        //lookahead first to prime the token buffer
        this.LA(index);
        
        //now find the token, subtract one because _ltIndex is already at the next index
        return this._lt[this._ltIndex+index-1];    
    },
    
    /**
     * Returns the token type for the next token in the stream without 
     * consuming it.
     * @return {int} The token type of the next token in the stream.
     * @method peek
     */
    peek: function(){
        return this.LA(1);
    },
    
    /**
     * Returns the actual token object for the last consumed token.
     * @return {Token} The token object for the last consumed token.
     * @method token
     */
    token: function(){
        return this._token;
    },
    
    /**
     * Returns the name of the token for the given token type.
     * @param {int} tokenType The type of token to get the name of.
     * @return {String} The name of the token or "UNKNOWN_TOKEN" for any
     *      invalid token type.
     * @method tokenName
     */
    tokenName: function(tokenType){
        if (tokenType < 0 || tokenType > this._tokenData.length){
            return "UNKNOWN_TOKEN";
        } else {
            return this._tokenData[tokenType].name;
        }
    },
    
    /**
     * Returns the token type value for the given token name.
     * @param {String} tokenName The name of the token whose value should be returned.
     * @return {int} The token type value for the given token name or -1
     *      for an unknown token.
     * @method tokenName
     */    
    tokenType: function(tokenName){
        return tokenInfo[tokenName] || -1;
    },
    
    /**
     * Returns the last consumed token to the token stream.
     * @method unget
     */      
    unget: function(){
        if (this._ltIndex > -1){
            this._ltIndex--;
            this._token = this._lt[this._ltIndex - 1];
        } else {
            throw new Error("Too much lookahead.");
        }
    }

};

