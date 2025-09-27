import { Task } from 'projen';

import { CalmsTypescriptBase, CalmsTypescriptBaseOptions } from './ctb';
import { ManagedJsonFile } from './managed-json-file';

export interface CalmsTypescriptCdkOptions extends CalmsTypescriptBaseOptions {}

export class CalmsTypescriptCdk extends CalmsTypescriptBase {
  public readonly deployTask: Task;
  public readonly deployDevTask: Task;
  public readonly deployUatTask: Task;
  public readonly deployProdTask: Task;
  constructor(options: CalmsTypescriptCdkOptions) {
    super(options);

    // Add CDK dev dependencies
    this.addDevDeps('aws-cdk-lib', 'aws-cdk');

    // Override the compile task to use tsc --noEmit
    this.compileTask.reset('tsc -p tsconfig.json --noEmit');

    // Add pre-compile task to clean build and cdk.out directories
    this.preCompileTask.reset('rimraf build cdk.out');

    // Add post-compile task to run cdk synth
    this.postCompileTask.reset('cdk synth --silent');

    // Add deploy tasks for different environments
    this.deployTask = this.addTask('deploy', {
      description: 'Deploy to dev stage',
      exec: 'cdk deploy dev/*',
      receiveArgs: true,
    });

    this.deployDevTask = this.addTask('deploy:dev', {
      description: 'Deploy to dev stage',
      exec: 'cdk deploy dev/*',
      receiveArgs: true,
    });

    this.deployUatTask = this.addTask('deploy:uat', {
      description: 'Deploy to UAT stage',
      exec: 'cdk deploy uat/*',
      receiveArgs: true,
    });

    this.deployProdTask = this.addTask('deploy:prod', {
      description: 'Deploy to production stage',
      exec: 'cdk deploy prod/*',
      receiveArgs: true,
    });

    // Create cdk.json configuration
    new ManagedJsonFile(this, 'cdk.json', {
      obj: {
        app: 'tsx cdk/bin/app.ts',
        watch: {
          include: ['**'],
          exclude: [
            'README.md',
            'cdk*.json',
            '**/*.d.ts',
            '**/*.js',
            'tsconfig.json',
            'package*.json',
            'yarn.lock',
            'node_modules',
            'test',
          ],
        },
        context: {
          '@aws-cdk/aws-lambda:recognizeLayerVersion': true,
          '@aws-cdk/core:checkSecretUsage': true,
          '@aws-cdk/core:target-partitions': ['aws', 'aws-cn'],
          '@aws-cdk-containers/ecs-service-extensions:enableDefaultLogDriver': true,
          '@aws-cdk/aws-ec2:uniqueImdsv2TemplateName': true,
          '@aws-cdk/aws-ecs:arnFormatIncludesClusterName': true,
          '@aws-cdk/aws-iam:minimizePolicies': true,
          '@aws-cdk/core:validateSnapshotRemovalPolicy': true,
          '@aws-cdk/aws-codepipeline:crossAccountKeyAliasStackSafeResourceName': true,
          '@aws-cdk/aws-s3:createDefaultLoggingPolicy': true,
          '@aws-cdk/aws-sns-subscriptions:restrictSqsDescryption': true,
          '@aws-cdk/aws-apigateway:disableCloudWatchRole': true,
          '@aws-cdk/core:enablePartitionLiterals': true,
          '@aws-cdk/aws-events:eventsTargetQueueSameAccount': true,
          '@aws-cdk/aws-iam:standardizedServicePrincipals': true,
          '@aws-cdk/aws-ecs:disableExplicitDeploymentControllerForCircuitBreaker': true,
          '@aws-cdk/aws-iam:importedRoleStackSafeDefaultPolicyName': true,
          '@aws-cdk/aws-s3:serverAccessLogsUseBucketPolicy': true,
          '@aws-cdk/aws-route53-patters:useCertificate': true,
          '@aws-cdk/customresources:installLatestAwsSdkDefault': false,
          '@aws-cdk/aws-rds:databaseProxyUniqueResourceName': true,
          '@aws-cdk/aws-codedeploy:removeAlarmsFromDeploymentGroup': true,
          '@aws-cdk/aws-apigateway:authorizerChangeDeploymentLogicalId': true,
          '@aws-cdk/aws-ec2:launchTemplateDefaultUserData': true,
          '@aws-cdk/aws-secretsmanager:useAttachedSecretResourcePolicyForSecretTargetAttachments': true,
          '@aws-cdk/aws-redshift:columnId': true,
          '@aws-cdk/aws-stepfunctions-tasks:enableLogging': true,
          '@aws-cdk/aws-ec2:restrictDefaultSecurityGroup': true,
          '@aws-cdk/aws-apigateway:requestValidatorUniqueId': true,
          '@aws-cdk/aws-kms:aliasNameRef': true,
          '@aws-cdk/aws-autoscaling:generateLaunchTemplateInsteadOfLaunchConfig': true,
          '@aws-cdk/core:includePrefixInUniqueNameGeneration': true,
          '@aws-cdk/aws-efs:denyAnonymousAccess': true,
          '@aws-cdk/aws-opensearchservice:enableLogging': true,
          '@aws-cdk/aws-s3:autoDeleteBucketContents': true,
          '@aws-cdk/aws-route53-resolver:firewall': true,
          '@aws-cdk/aws-ec2:ipamPoolPublicIpSource': true,
          '@aws-cdk/core:useCorrectRegionForStackSynthesis': true,
          '@aws-cdk/aws-lambda:automaticAsyncInvocation': true,
        },
      },
    });

    // Add CDK directories to gitignore
    this.gitignore.addPatterns('cdk.out/', '*.js', '*.d.ts', '!cdk/bin/app.ts');

    // Update TypeScript configuration to include CDK directories
    this.tsconfig?.addInclude('cdk/**/*.ts');
  }
}
