import React, { useEffect, useState } from 'react';

const Age = () => {
  const [isOver18, setIsOver18] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const hasConfirmedAge = localStorage.getItem('over18');
    if (!hasConfirmedAge) {
      setModalOpen(true);
    } else {
      setIsOver18(true);
    }
  }, []);

  const handleYesClick = () => {
    localStorage.setItem('over18', 'true');
    setIsOver18(true);
    setModalOpen(false);
  };

  if (!modalOpen && isOver18) {
    // Render the content of your application here, now that the user has confirmed
    return <div></div>;
  }

  return (
    <div>
      <dialog id="my_modal_1" className={`modal ${modalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Are you 18+?</h3>
          <p className="py-4">
            Try the forbidden fruit by clicking 'Yes' if you are at least 18 years old and agree to our Terms and Privacy Policy.
          </p>
          <div className="modal-action">
            <button className="btn btn-error" onClick={handleYesClick}>
              Yes
            </button>
            {/* You might want to add a "No" option as well */}
            {/* <button className="btn" onClick={() => setModalOpen(false)}>No</button> */}
          </div>
        </div>
      </dialog>
      {/* If the modal is closed and the user hasn't confirmed, you might want to show a restricted message */}
      {!modalOpen && !isOver18 && <div>Content restricted for users under 18.</div>}
    </div>
  );
};

export default Age;