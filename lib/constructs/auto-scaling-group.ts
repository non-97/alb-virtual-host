import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as fs from "fs";
import * as path from "path";

export interface AutoScalingGroupProps {
  vpc: cdk.aws_ec2.IVpc;
}

export class AutoScalingGroup extends Construct {
  readonly asg: cdk.aws_autoscaling.AutoScalingGroup;

  constructor(scope: Construct, id: string, props: AutoScalingGroupProps) {
    super(scope, id);

    // User data
    const userDataScript = fs.readFileSync(
      path.join(__dirname, "../ec2/user-data.sh"),
      "utf8"
    );
    const userData = cdk.aws_ec2.UserData.forLinux({
      shebang: "#!/bin/bash",
    });
    userData.addCommands(userDataScript);

    this.asg = new cdk.aws_autoscaling.AutoScalingGroup(this, "Asg", {
      machineImage: cdk.aws_ec2.MachineImage.latestAmazonLinux2023({
        cachedInContext: true,
      }),
      instanceType: new cdk.aws_ec2.InstanceType("t3.micro"),
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets({
        subnetGroupName: "Public",
      }),
      maxCapacity: 2,
      minCapacity: 2,
      ssmSessionPermissions: true,
      userData,
      healthCheck: cdk.aws_autoscaling.HealthCheck.elb({
        grace: cdk.Duration.minutes(30),
      }),
    });
  }
}
