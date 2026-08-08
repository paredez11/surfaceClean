// front3/src/pages/ContactPage/ContactPage.tsx

import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-container">
      <h1>Contact Surface Clean</h1>
      <p>
        Got questions about a machine? Looking for a specific model? Need help choosing the right
        equipment? I’d love to help.
      </p>
      <p>
        Just send me a quick message with what you’re looking for, and I’ll get back to you as soon
        as I can. If you’ve got a machine in mind, let me know the model number or general details.
      </p>
      <p>
        You can reach me directly by <strong>email</strong> at{' '}
        <a href="mailto:surfaceclean111@yahoo.com">surfaceclean111@yahoo.com</a> or by{' '}
        <strong>phone</strong> at{' '}
        <a href="tel:+19402053616">(940) 205-3616</a>.
      </p>
      <p>Thanks for stopping by, and I look forward to helping you find the right solution!</p>
    </div>
  );
};

export default ContactPage;