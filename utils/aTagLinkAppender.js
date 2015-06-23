function urlChecker(url, baseUrl, host) {

    if (baseUrl.slice(-1) == "/") {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    if (url.charAt(0) === "/") {
        if (url.indexOf("//") == 0) {
            return baseUrl + url.replace('//', 'http://');
        } else {
            return baseUrl + host + url;
        }
    }

    if (url.indexOf("http") == 0) {
        return baseUrl + url;
    }

    if (url.indexOf("'") == 0) {
        return "";
    }

    if (url.indexOf("javascript") == 0) {
        return "";
    }

    return baseUrl + host + "/" + url;
}

function aTagLinkAppender(html, baseUrl, host) {
    /*HTML/XML Attribute may not be prefixed by these characters (common
     attribute chars.  This list is not complete, but will be sufficient
     for this function (see http://www.w3.org/TR/REC-xml/#NT-NameChar). */
    var att = "[^-a-z0-9:._]";

    var entityEnd = "(?:;|(?!\\d))";
    var ents = {
        " ": "(?:\\s|&nbsp;?|&#0*32" + entityEnd + "|&#x0*20" + entityEnd + ")",
        "(": "(?:\\(|&#0*40" + entityEnd + "|&#x0*28" + entityEnd + ")",
        ")": "(?:\\)|&#0*41" + entityEnd + "|&#x0*29" + entityEnd + ")",
        ".": "(?:\\.|&#0*46" + entityEnd + "|&#x0*2e" + entityEnd + ")"
    };
    /* Placeholders to filter obfuscations */
    var charMap = {};
    var s = ents[" "] + "*"; //Short-hand for common use
    var any = "(?:[^>\"']*(?:\"[^\"]*\"|'[^']*'))*?[^>]*";
    /* ^ Important: Must be pre- and postfixed by < and >.
     *   This RE should match anything within a tag!  */

    /*
     @name ae
     @description  Converts a given string in a sequence of the original
     input and the HTML entity
     @param String string  String to convert
     */
    function ae(string) {
        var all_chars_lowercase = string.toLowerCase();
        if (ents[string]) return ents[string];
        var all_chars_uppercase = string.toUpperCase();
        var RE_res = "";
        for (var i = 0; i < string.length; i++) {
            var char_lowercase = all_chars_lowercase.charAt(i);
            if (charMap[char_lowercase]) {
                RE_res += charMap[char_lowercase];
                continue;
            }
            var char_uppercase = all_chars_uppercase.charAt(i);
            var RE_sub = [char_lowercase];
            RE_sub.push("&#0*" + char_lowercase.charCodeAt(0) + entityEnd);
            RE_sub.push("&#x0*" + char_lowercase.charCodeAt(0).toString(16) + entityEnd);
            if (char_lowercase != char_uppercase) {
                /* Note: RE ignorecase flag has already been activated */
                RE_sub.push("&#0*" + char_uppercase.charCodeAt(0) + entityEnd);
                RE_sub.push("&#x0*" + char_uppercase.charCodeAt(0).toString(16) + entityEnd);
            }
            RE_sub = "(?:" + RE_sub.join("|") + ")";
            RE_res += (charMap[char_lowercase] = RE_sub);
        }
        return (ents[string] = RE_res);
    }

    /*
     @name by
     @description  2nd argument for replace().
     */
    function by(match, group1, group2, group3) {
        /* Note that this function can also be used to remove links:
         * return group1 + "javascript://" + group3; */
        return group1 + urlChecker(group2, baseUrl, host) + group3;
    }

    /*
     @name by2
     @description  2nd argument for replace(). Parses relevant HTML entities
     */
    var slashRE = new RegExp(ae("/"), 'g');
    var dotRE = new RegExp(ae("."), 'g');

    function by2(match, group1, group2, group3) {
        /*Note that this function can also be used to remove links:
         * return group1 + "javascript://" + group3; */
        group2 = group2.replace(slashRE, "/").replace(dotRE, ".");
        return group1 + urlChecker(group2, baseUrl, host) + group3;
    }

    /*
     @name cr
     @description            Selects a HTML element and performs a
     search-and-replace on attributes
     @param String selector  HTML substring to match
     @param String attribute RegExp-escaped; HTML element attribute to match
     @param String marker    Optional RegExp-escaped; marks the prefix
     @param String delimiter Optional RegExp escaped; non-quote delimiters
     @param String end       Optional RegExp-escaped; forces the match to end
     before an occurence of <end>
     */
    function cr(selector, attribute, marker, delimiter, end) {
        if (typeof selector == "string") selector = new RegExp(selector, "gi");
        attribute = att + attribute;
        marker = typeof marker == "string" ? marker : "\\s*=\\s*";
        delimiter = typeof delimiter == "string" ? delimiter : "";
        end = typeof end == "string" ? "?)(" + end : ")(";
        var re1 = new RegExp('(' + attribute + marker + '")([^"' + delimiter + ']+' + end + ')', 'gi');
        var re2 = new RegExp("(" + attribute + marker + "')([^'" + delimiter + "]+" + end + ")", 'gi');
        var re3 = new RegExp('(' + attribute + marker + ')([^"\'][^\\s>' + delimiter + ']*' + end + ')', 'gi');
        html = html.replace(selector, function (match) {
            return match.replace(re1, by).replace(re2, by).replace(re3, by);
        });
    }

    cr("<a" + any + att + "href\\s*=" + any + ">", "href");
    /* Linked elements */

    return html;
}

module.exports.aTagLinkAppender = aTagLinkAppender;