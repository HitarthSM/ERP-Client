import { Navigate } from 'react-router-dom';

/**
 * User roles are now merged into the unified Users management page (/users).
 * This component redirects any direct hits to /users.
 */
export default function UserRolesPage(): React.JSX.Element {
  return <Navigate to="/users" replace />;
}
