export default function SideBar({ sidebarContainerStyle = '' }) {
  return (
    <div
      className={`side-bar d-flex 
  flex-column pt-3 px-2 ${sidebarContainerStyle}`}>
      <style jsx>
        {`
          .side-bar {
            width: 18.75rem;
            background-color: #eee;
          }
        `}
      </style>
      <span>
        <hr />
      </span>
    </div>
  );
}
