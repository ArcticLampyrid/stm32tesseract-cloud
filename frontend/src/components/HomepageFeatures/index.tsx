import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Translate, { translate } from '@docusaurus/Translate';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: translate(
      {
        id: 'homepage.features.cmakeIntegration.title',
        message: 'CMake Integration',
      },
    ),
    description: (
      <Translate id="homepage.features.cmakeIntegration.description">
        Effortlessly integrate with CMake to streamline your build process.
      </Translate>
    ),
  },
  {
    title: translate(
      {
        id: 'homepage.features.buildEnvironmentSetup.title',
        message: 'Build Environment Setup',
      },
    ),
    description: (
      <Translate id="homepage.features.buildEnvironmentSetup.description">
        Provides a straightforward approach to configuring your build environment.
      </Translate>
    ),
  },
  {
    title: translate(
      {
        id: 'homepage.features.vscodeProjectSetup.title',
        message: 'VSCode Project Setup',
      },
    ),
    description: (
      <Translate id="homepage.features.vscodeProjectSetup.description">
        Simplifies the process of setting up a project in Visual Studio Code.
      </Translate>
    ),
  },
  {
    title: translate(
      {
        id: 'homepage.features.clionProjectSetup.title',
        message: 'CLion Project Setup',
      },
    ),
    description: (
      <Translate id="homepage.features.clionProjectSetup.description">
        Enables easy configuration of CLion projects.
      </Translate>
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
