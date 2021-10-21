import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';


export const parseComponent = (html, opts = {}) => {
    return parse(DOMPurify.sanitize(html), opts);
}