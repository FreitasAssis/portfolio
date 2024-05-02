import styles from './page.module.css';
import skills from './lib/skills.jsx';
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import SkillIcon from './components/skillIcon/SkillIcon';

export default function Home() {
  const totalSkills = skills.length;
  const radius = 250;
  const center = { x: 150, y: 150 };
  
  const getSkillPosition = (index: number) => {
    const angle = (index / totalSkills) * 2 * Math.PI;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    return { x, y };
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <Header />
      <div className={styles.skillsContainer}>
        <div className={`${styles.skillsCircle} hidden lg:block`}>
          <div className={styles.skills}>
            {skills.map((skill, index) => {
              const { x, y } = getSkillPosition(index);
              return (
                <div
                  key={index}
                  className="absolute flex items-center justify-center"
                  style={{ top: `${y}px`, left: `${x}px` }}
                >
                  <SkillIcon key={index} icon={skill.path} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
