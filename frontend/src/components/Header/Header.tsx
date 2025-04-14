import styles from "./Header.module.scss";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return <header className={styles.header}></header>;
};

export default Header;
