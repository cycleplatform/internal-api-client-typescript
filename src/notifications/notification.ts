export type NotificationMessage = {
    topic: Topic;
    object: {
        id: string;
        state?: string;
        state_previous?: string;
        error?: string;
    };
    context: {
        label: string | null;
        hub_id: string | null;
        account_id: string | null;
        environments: string[] | null;
        dns_zones: string[] | null;
        containers: string[] | null;
        clusters: string[] | null;
    };
    flags?: Record<string, boolean | null>;
    annotations?: {
        health?: "unknown" | "healthy" | "unhealthy";
        ready?: "unknown" | "ready" | "pending";
    };
};

export type Topic =
    // billing credits
    | "billing.credit.new"
    | "billing.credit.state.changed"
    | "billing.credit.error"
    | "billing.credit.error_reset"

    // billing discount
    | "billing.discount.state.changed"
    | "billing.discount.error"
    | "billing.discount.error_reset"

    // billing invoice
    | "billing.invoice.new"
    | "billing.invoice.updated"
    | "billing.invoice.state.changed"
    | "billing.invoice.error"
    | "billing.invoice.error_reset"

    //billing method
    | "billing.method.new"
    | "billing.method.state.changed"
    | "billing.method.updated"
    | "billing.method.error"
    | "billing.method.error_reset"

    // billing order
    | "billing.order.new"
    | "billing.order.state.changed"
    | "billing.order.error"
    | "billing.order.error_reset"
    | "billing.order.updated"

    // billing service
    | "billing.service.state.changed"
    | "billing.service.error"
    | "billing.service.error_reset"

    // container
    | "container.new"
    | "container.updated"
    | "container.reconfigured"
    | "container.state.changed"
    | "container.desired_state.changed"
    | "container.error"
    | "container.error_reset"

    // container backup
    | "container.backup.new"
    | "container.backup.error"
    | "container.backup.state.changed"
    | "container.backup.error_reset"

    // container instance
    | "container.instance.state.changed"
    | "container.instance.error"
    | "container.instance.error_reset"
    | "container.instances.reconfigured"
    | "container.instance.traffic-drain.reconfigured"
    | "container.instance.migration.update"
    | "container.instance.health.status.changed"
    | "container.instance.readiness.status.changed"

    // dns certificate
    | "dns.certificate.new"
    | "dns.certificate.state.changed"
    | "dns.certificate.error"
    | "dns.certificate.error_reset"

    // dns zone
    | "dns.zone.state.changed"
    | "dns.zone.error"
    | "dns.zone.error_reset"
    | "dns.zone.new"
    | "dns.zone.verified"
    | "dns.zone.reconfigured"
    | "dns.zone.certificate.ready"

    // dns zone record
    | "dns.zone.record.state.changed"
    | "dns.zone.records.reconfigured"

    // environments
    | "environment.started"
    | "environment.stopped"
    | "environment.new"
    | "environment.updated"
    | "environment.error"
    | "environment.error_reset"
    | "environment.state.changed"

    // environment pods
    | "environment.pod.new"
    | "environment.pod.updated"
    | "environment.pod.error"
    | "environment.pod.error_reset"
    | "environment.pod.state.changed"

    // environment scoped variables
    | "environment.scoped-variable.new"
    | "environment.scoped-variable.updated"
    | "environment.scoped-variable.state.changed"
    | "environment.scoped-variable.error"
    | "environment.scoped-variable.error_reset"

    // environment services
    | "environment.services.reconfigured"
    | "environment.services.vpn.users.updated"
    | "environment.services.lb.ips.modified"

    // deployments
    | "environment.deployments.reconfigured"

    // events
    | "event.pushed"

    // hub
    | "hub.activity.new"
    | "hub.state.changed"
    | "hub.error"
    | "hub.error_reset"
    | "hub.updated"

    // hub locations
    | "hub.location.state.changed"
    | "hub.location.error"
    | "hub.location.error_reset"
    | "hub.location.new"
    | "hub.location.updated"

    // hub api keys
    | "hub.api_key.new"
    | "hub.api_key.updated"
    | "hub.api_key.state.changed"
    | "hub.api_key.error"
    | "hub.api_key.error_reset"

    // hub memberships
    | "hub.membership.state.changed"
    | "hub.membership.error"
    | "hub.membership.updated"
    | "hub.membership.new"
    | "hub.membership.error_reset"

    // hub roles
    | "hub.role.state.changed"
    | "hub.role.error"
    | "hub.role.updated"
    | "hub.role.new"
    | "hub.role.error_reset"

    // hub integration
    | "hub.integration.state.changed"
    | "hub.integration.error"
    | "hub.integration.updated"
    | "hub.integration.new"
    | "hub.integration.error_reset"

    // images
    | "image.new"
    | "image.state.changed"
    | "image.updated"
    | "image.error"
    | "image.error_reset"

    // image-sources
    | "image.source.state.changed"
    | "image.source.error"
    | "image.source.error_reset"
    | "image.source.updated"
    | "image.source.new"

    // infrastructure external volumes
    | "infrastructure.external-volumes.new"
    | "infrastructure.external-volumes.state.changed"
    | "infrastructure.external-volumes.reconfigured"
    | "infrastructure.external-volumes.updated"
    | "infrastructure.external-volumes.error"
    | "infrastructure.external-volumes.error_reset"

    // infrastructure ips assignment
    | "infrastructure.ips.assignment.state.changed"
    | "infrastructure.ips.assignment.error"
    | "infrastructure.ips.assignment.error_reset"

    // virtual providers
    | "infrastructure.virtual-providers.iso.new"
    | "infrastructure.virtual-providers.iso.updated"
    | "infrastructure.virtual-providers.iso.state.changed"
    | "infrastructure.virtual-providers.iso.error"
    | "infrastructure.virtual-providers.iso.error_reset"

    // infrastructure ips pool
    | "ips_pool.new"
    | "ips_pool.state.changed"
    | "ips_pool.reconfigured"
    | "ips_pool.error"
    | "ips_pool.error_reset"

    // infrastructure cluster
    | "infrastructure.cluster.state.changed"
    | "infrastructure.cluster.error"
    | "infrastructure.cluster.error_reset"
    | "infrastructure.cluster.new"
    | "infrastructure.cluster.updated"
    | "infrastructure.cluster.monitoring.reconfigured"

    // infrastructure provider
    | "infrastructure.provider.state.changed"
    | "infrastructure.provider.error"
    | "infrastructure.provider.error_reset"
    | "infrastructure.provider.new"
    | "infrastructure.provider.updated"

    // infrastructure.external-volumes
    | "infrastructure.external-volumes.new"
    | "infrastructure.external-volumes.state.changed"
    | "infrastructure.external-volumes.reconfigured"
    | "infrastructure.external-volumes.updated"
    | "infrastructure.external-volumes.attachments.updated"
    | "infrastructure.external-volumes.error"
    | "infrastructure.external-volumes.error_reset"

    // infrastructure server
    | "infrastructure.server.state.changed"
    | "infrastructure.server.error"
    | "infrastructure.server.new"
    | "infrastructure.server.reconfigured"
    | "infrastructure.server.restart"
    | "infrastructure.server.compute.restart"
    | "infrastructure.server.error_reset"
    | "infrastructure.server.evacuation.changed"
    | "infrastructure.server.evacuation.started"
    | "infrastructure.server.evacuation.completed"

    // infrastructure autoscale
    | "infrastructure.autoscale.group.state.changed"
    | "infrastructure.autoscale.group.error"
    | "infrastructure.autoscale.group.error_reset"
    | "infrastructure.autoscale.group.new"
    | "infrastructure.autoscale.group.reconfigured"
    | "infrastructure.autoscale.group.updated"

    // internal //TODO check with mattoni on this
    | "internal.service.compute.connected"

    // jobs
    | "job.new"
    | "job.state.changed"
    | "job.error"

    // pipeline
    | "pipeline.state.changed"
    | "pipeline.error"
    | "pipeline.error_reset"
    | "pipeline.updated"
    | "pipeline.new"

    // pipeline key
    | "pipeline.key.state.changed"
    | "pipeline.key.error"
    | "pipeline.key.error_reset"
    | "pipeline.key.updated"
    | "pipeline.key.new"

    // pipeline run
    | "pipeline.run.state.changed"
    | "pipeline.run.error"
    | "pipeline.run.error_reset"
    | "pipeline.run.new"
    | "pipeline.run.updated"

    // sdn
    | "sdn.network.new"
    | "sdn.network.error"
    | "sdn.network.error_reset"
    | "sdn.network.reconfigured"
    | "sdn.network.state.changed"
    | "sdn.network.updated"

    // stack
    | "stack.state.changed"
    | "stack.error"
    | "stack.error_reset"
    | "stack.new"
    | "stack.updated"

    // stack builds
    | "stack.build.new"
    | "stack.build.state.changed"
    | "stack.build.error"
    | "stack.build.error_reset"
    | "stack.build.deployed"

    // virtual machines
    | "virtual-machine.new"
    | "virtual-machine.updated"
    | "virtual-machine.reconfigured"
    | "virtual-machine.state.changed"
    | "virtual-machine.error"
    | "virtual-machine.error_reset"
    | "virtual-machine.ips.modified"

    // virtual machine ssh keys
    | "virtual-machine.ssh-key.new"
    | "virtual-machine.ssh-key.updated"
    | "virtual-machine.ssh-key.state.changed"
    | "virtual-machine.ssh-key.error"
    | "virtual-machine.ssh-key.error_reset";
