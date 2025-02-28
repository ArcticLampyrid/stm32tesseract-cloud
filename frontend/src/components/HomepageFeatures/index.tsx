import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'CMake Integration',
    description: (
      <>
        Effortlessly integrate with CMake to streamline your build process.
      </>
    ),
  },
  {
    title: 'Build Environment Setup',
    description: (
      <>
        Provides a straightforward approach to configuring your build environment.
      </>
    ),
  },
  {
    title: 'VSCode Project Setup',
    description: (
      <>
        Simplifies the process of setting up a project in Visual Studio Code.
      </>
    ),
  },
  {
    title: 'CLion Project Setup',
    description: (
      <>
        Enables easy configuration of CLion projects.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
