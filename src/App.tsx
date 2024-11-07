import React, { useEffect, useState } from "react";
import "./App.css";

type LinkData = {
  label: string;
  href: string;
  type: "train" | "bus";
};

type RevisionStatus = "O" | "N";
const revisionStates: Record<"before" | "after", RevisionStatus> = {
  before: "O",
  after: "N",
};

const busStops = {
  miyazaki_eki: "000LM0001",
  depato_mae: "000LM3002",
  karino_mae: "000G00129",
};

const getTrainLink = (direction: "going" | "returning"): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  const baseUrl =
    direction === "going"
      ? "https://www.jorudan.co.jp/time/to/%E5%8D%97%E5%AE%AE%E5%B4%8E_%E5%AE%AE%E5%B4%8E/?r=%E6%97%A5%E8%B1%8A%E6%9C%AC%E7%B7%9A"
      : "https://www.jorudan.co.jp/time/to/%E5%AE%AE%E5%B4%8E_%E5%8D%97%E5%AE%AE%E5%B4%8E/?r=%E6%97%A5%E8%B1%8A%E6%9C%AC%E7%B7%9A";

  return `${baseUrl}&Dym=${year}${month}&Ddd=${day}`;
};

const getBusLink = (
  from: string,
  to: string,
  revisionStatus: RevisionStatus
): string => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  return `https://qbus.jp/cgi-bin/time/jun.exe?pwd=h%2Fjun.pwd&from=${from}&to=${to}&kai=${revisionStatus}&yobi=0&ji=${hour}&fun=${minutes}`;
};

const App: React.FC = () => {
  const [goingLinks, setGoingLinks] = useState<LinkData[]>([]);
  const [returningLinks, setReturningLinks] = useState<LinkData[]>([]);
  // current date and time
  const [time, setTime] = useState(new Date());

  const refreshLinks = () => {
    setGoingLinks([
      {
        label: "電車（行き）",
        href: getTrainLink("going"),
        type: "train",
      },
      {
        label: "バス（行き）",
        href: getBusLink(
          busStops.miyazaki_eki,
          busStops.depato_mae,
          revisionStates.before
        ),
        type: "bus",
      },
    ]);

    setReturningLinks([
      {
        label: "電車（帰り）",
        href: getTrainLink("returning"),
        type: "train",
      },
      {
        label: "バス（帰り）",
        href: getBusLink(
          busStops.karino_mae,
          busStops.miyazaki_eki,
          revisionStates.before
        ),
        type: "bus",
      },
    ]);
  };

  useEffect(() => {
    refreshLinks();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshLinks();
        setTime(new Date());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="container">
      <h1>{time.toLocaleString()}</h1>
      <LinkSection title="行き" links={goingLinks} />
      <LinkSection title="帰り" links={returningLinks} />
    </div>
  );
};

const LinkSection: React.FC<{ title: string; links: LinkData[] }> = ({
  title,
  links,
}) => (
  <div className="section">
    <h2>{title}</h2>
    {links.map((link, index) => (
      <a
        key={index}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`link ${link.type}`}
      >
        {link.label}
      </a>
    ))}
  </div>
);

export default App;
