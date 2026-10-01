import { Link } from 'react-router-dom';
import { Card, EmptyState } from '../components/common/ui';

export default function NotFoundPage() {
  return (
    <div style={{ maxWidth: 560, margin: '4rem auto' }}>
      <Card>
        <EmptyState
          icon="warning"
          title="Page not found"
          text="The page you're looking for doesn't exist or has moved."
          action={<Link to="/" className="btn btn-primary">Go home</Link>}
        />
      </Card>
    </div>
  );
}
