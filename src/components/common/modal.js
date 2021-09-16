import { useEffect } from 'react';
export default function Modal({ children }) {
  useEffect(() => {}, []);
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
