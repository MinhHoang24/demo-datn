import Popular from '../../Components/Popular/Popular.jsx';
import './Home.css';
import { CATEGORY_LIST } from '../../Constants/Category.ts';

function Home() {

  return (
    <div className="home">
      {CATEGORY_LIST.map((category) => (
        <Popular
          key={category}
          category={category}
        />
      ))}
    </div>
  );
}

export default Home;