/*
 * Site configuration — edit these values, no build step needed.
 *
 * formEndpoint: URL that accepts the enquiry form as a POST and returns JSON.
 *   Works out of the box with Formspree (https://formspree.io):
 *   create a form there and paste its endpoint, e.g. "https://formspree.io/f/abcdwxyz".
 *   Any service that accepts multipart/form-data with an "Accept: application/json"
 *   header and returns a 2xx status on success will also work.
 *   While this is empty, the form validates input but tells visitors that online
 *   enquiries are not yet active. It never pretends a message was sent.
 *
 * fallbackEmail: optional business email shown when the form is not configured
 *   or a submission fails. Leave empty until a real address exists.
 */
window.KUDJOBA_CONFIG = {
  formEndpoint: "",
  fallbackEmail: ""
};
