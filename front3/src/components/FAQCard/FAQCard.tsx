// components/FAQCard/FAQCard.tsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { faqActions } from "../../redux";
import type { FAQ } from "../../types";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import "./FAQCard.css";

interface FAQCardProps {
  faq: FAQ;
}

const FAQCard = ({ faq }: FAQCardProps) => {
  const dispatch = useDispatch<any>();
  const user = useSelector((state: RootState) => state.session.user);
  const updatedFAQ = useSelector((state: RootState) => state.faqs.all[faq.id]);

  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (updatedFAQ) {
      setQuestion(updatedFAQ.question);
      setAnswer(updatedFAQ.answer);
    }
  }, [updatedFAQ]);

  const handleEdit = async () => {
    if (editing && (question !== faq.question || answer !== faq.answer)) {
      await dispatch(
        faqActions.editFaq(faq.id, {
          question,
          answer,
        })
      );
    }
    setEditing(!editing);
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    dispatch(faqActions.removeFaq(faq.id));
    setShowConfirm(false);
  };

  return (
    <div className="faq-card">
      {editing ? (
        <>
          <input
            className="faq-edit-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            className="faq-edit-textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </>
      ) : (
        <>
          <h3 className="faq-question">Q: {question}</h3>
          <p className="faq-answer">A: {answer}</p>
        </>
      )}

      {user && (
        <div className="faq-actions">
          <button onClick={handleEdit} className="btn-edit">
            {editing ? "Save" : "EDIT"}
          </button>
          <button onClick={handleDelete} className="btn-delete">
            DELETE
          </button>
        </div>
      )}

      {showConfirm && (
        <ConfirmationModal
          title="Confirm Deletion"
          message="Are you sure you want to delete this FAQ?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default FAQCard;